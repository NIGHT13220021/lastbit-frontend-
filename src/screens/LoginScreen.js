import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../store/AuthContext";
import colors from "../theme/colors";

export default function LoginScreen() {
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const [busy, setBusy] = useState(false);

  async function onGoogle() {
    if (busy) return;
    setBusy(true);
    try {
      await signInWithGoogle();
      // On success the navigator switches to the app automatically
    } catch (e) {
      Alert.alert("Login failed", e?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.top}>
        <View style={s.logo}>
          <Text style={{ fontSize: 44 }}>🥬</Text>
        </View>
        <Text style={s.brand}>LastBite</Text>
        <Text style={s.tag}>Good food deserves another chance.</Text>
        <Text style={s.sub}>Rescue discounted surplus food from shops near you.</Text>
      </View>

      <View style={s.bottom}>
        <Pressable style={[s.googleBtn, busy && { opacity: 0.7 }]} onPress={onGoogle} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={s.googleText}>Continue with Google</Text>
            </>
          )}
        </Pressable>

        {/* Only visible while developing. Not shown in the real app */}
        {__DEV__ && (
          <Pressable onPress={continueAsGuest} style={s.guest}>
            <Text style={s.guestText}>Skip for now (dev only)</Text>
          </Pressable>
        )}

        <Text style={s.legal}>
          By continuing you agree to the Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, justifyContent: "space-between", paddingHorizontal: 24 },
  top: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  brand: { fontSize: 34, fontWeight: "800", color: colors.primary, letterSpacing: -0.5 },
  tag: { fontSize: 17, fontWeight: "700", color: colors.text, marginTop: 10, textAlign: "center" },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 8, textAlign: "center", lineHeight: 21 },

  bottom: { paddingBottom: 18 },
  googleBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleText: { fontSize: 16, fontWeight: "700", color: colors.text },
  guest: { alignItems: "center", paddingVertical: 14 },
  guestText: { color: colors.textMuted, fontSize: 13, textDecorationLine: "underline" },
  legal: { fontSize: 11, color: colors.textMuted, textAlign: "center", marginTop: 8, lineHeight: 16 },
});