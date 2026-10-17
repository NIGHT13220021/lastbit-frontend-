import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Text } from "../components/AppText";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import { useAuth } from "../store/AuthContext";

export default function SplashScreen({ navigation }) {
  const { session, loading } = useAuth();
  const [animDone, setAnimDone] = useState(false);
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textLift = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 55, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.spring(badgeScale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(textLift, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();

    const t = setTimeout(() => setAnimDone(true), 2300);
    return () => clearTimeout(t);
  }, []);

  // continue once the animation is done and the saved login has been checked
  useEffect(() => {
    if (animDone && !loading) navigation.replace(session ? "Main" : "Login");
  }, [animDone, loading, session, navigation]);

  return (
    <View style={s.root}>
      <StatusBar style="light" />

      {/* soft background circles */}
      <View style={[s.bgCircle, { width: 320, height: 320, top: -110, right: -120 }]} />
      <View style={[s.bgCircle, { width: 260, height: 260, bottom: -90, left: -100 }]} />
      <View style={[s.bgCircle, { width: 120, height: 120, top: "58%", right: 30, opacity: 0.6 }]} />

      <View style={s.center}>
        <Animated.View style={[s.plate, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <View style={s.plateInner}>
            <Ionicons name="restaurant" size={50} color={colors.primary} />
          </View>
          {/* clock badge = closing-time food */}
          <Animated.View style={[s.badge, { transform: [{ scale: badgeScale }] }]}>
            <Ionicons name="time" size={22} color="#fff" />
          </Animated.View>
        </Animated.View>

        <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textLift }], alignItems: "center" }}>
          <Text style={s.title}>LastBite</Text>
          <Text style={s.tagline}>Closing-time food, small prices</Text>
        </Animated.View>
      </View>

      <Animated.Text style={[s.footer, { opacity: textOpacity }]}>Restaurants · Dhabas · Sweet shops</Animated.Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  bgCircle: { position: "absolute", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.10)" },
  center: { alignItems: "center" },
  plate: {
    width: 150, height: 150, borderRadius: 75, backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 12,
  },
  plateInner: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", right: -4, bottom: 6, width: 46, height: 46, borderRadius: 23, backgroundColor: colors.rating, borderWidth: 4, borderColor: colors.primary, alignItems: "center", justifyContent: "center" },
  title: { marginTop: 30, fontSize: 40, fontWeight: "900", color: "#fff", letterSpacing: -1 },
  tagline: { marginTop: 8, fontSize: 15, color: "rgba(255,255,255,0.9)", fontWeight: "600" },
  footer: { position: "absolute", bottom: 48, fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "600", letterSpacing: 0.4 },
});