import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

// Reads params from both ?query and #hash parts of the callback URL
function parseParams(url) {
  const out = {};
  const query = url.includes("?") ? url.split("?")[1].split("#")[0] : "";
  const hash = url.includes("#") ? url.split("#")[1] : "";
  [query, hash].forEach((part) => {
    if (!part) return;
    part.split("&").forEach((kv) => {
      const [k, v] = kv.split("=");
      if (k) out[decodeURIComponent(k)] = decodeURIComponent(v || "");
    });
  });
  return out;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(false); // dev only: skip login while building UI

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) setGuest(false);
    });

    // Refresh the token only while the app is open
    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });

    return () => {
      sub.subscription.unsubscribe();
      appStateSub.remove();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // Expo Go: exp://192.168.x.x:8081/--/auth-callback
    // Built app: lastbite://auth-callback
    const redirectTo = Linking.createURL("auth-callback");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;

    // ---- DEBUG (remove once login works) ----
    console.log("[AUTH] REDIRECT TO:", redirectTo);
    console.log("[AUTH] CLIENT URL:", supabase.supabaseUrl);
    console.log("[AUTH] OAUTH URL:", data?.url);
    // -----------------------------------------

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    // ---- DEBUG ----
    console.log("[AUTH] BROWSER RESULT TYPE:", result.type);
    console.log("[AUTH] BROWSER RESULT URL:", result.url);
    // ---------------

    if (result.type !== "success") return { cancelled: true };

    const p = parseParams(result.url);
    if (p.error_description || p.error) throw new Error(p.error_description || p.error);

    if (p.code) {
      const { error: e } = await supabase.auth.exchangeCodeForSession(p.code);
      if (e) throw e;
    } else if (p.access_token && p.refresh_token) {
      const { error: e } = await supabase.auth.setSession({
        access_token: p.access_token,
        refresh_token: p.refresh_token,
      });
      if (e) throw e;
    } else {
      throw new Error("Login finished but no token came back. Check the Redirect URLs in Supabase.");
    }
    return { cancelled: false };
  }, []);

  const signOut = useCallback(async () => {
    setGuest(false);
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(() => {
    const user = session?.user || null;
    const meta = user?.user_metadata || {};
    return {
      session,
      user,
      loading,
      isSignedIn: !!session || guest,
      displayName: meta.full_name || meta.name || user?.email || "Guest",
      avatarUrl: meta.avatar_url || meta.picture || null,
      signInWithGoogle,
      signOut,
      continueAsGuest: () => setGuest(true),
    };
  }, [session, loading, guest, signInWithGoogle, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}