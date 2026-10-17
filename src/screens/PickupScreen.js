import React, { useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "../components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors, { softShadow } from "../theme/colors";
import { useDeals } from "../store/DealsContext";
import { Plate } from "../components/Plate";
import { minutesLeft, formatLeft } from "../utils/time";

export default function PickupScreen({ navigation, route }) {
  const { getOrder, getDeal, cancelOrder } = useDeals();
  const order = getOrder(route.params?.orderId);
  const deal = order ? getDeal(order.dealId) : null;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const toOrders = () => navigation.navigate("Main", { tab: "Orders" });

  const topBar = (
    <View style={s.topBar}>
      <Pressable onPress={toOrders} style={[s.roundBtn, softShadow]}>
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={s.topTitle}>Your pickup</Text>
      <View style={{ width: 42 }} />
    </View>
  );

  if (!order || !deal) {
    return (
      <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
        {topBar}
        <Text style={s.missing}>We couldn't find this order.</Text>
      </SafeAreaView>
    );
  }

  const left = minutesLeft(deal, new Date(now));
  const confirmed = order.status === "confirmed";
  const collectLeft = order.collectBy ? Math.max(0, Math.ceil((order.collectBy - now) / 60000)) : null;

  const hero =
    order.status === "confirmed"
      ? { bg: colors.primary, fg: "#fff", icon: "checkmark-circle", title: "Order confirmed", sub: collectLeft !== null ? `Collect within ${formatLeft(Math.max(1, collectLeft))} · show this code` : "Show this code at the counter" }
      : order.status === "collected"
      ? { bg: colors.success, fg: "#fff", icon: "bag-check", title: "Collected", sub: "Enjoy your meal" }
      : { bg: colors.dangerSoft, fg: colors.danger, icon: "close-circle", title: "Cancelled", sub: order.refund || "This order was cancelled" };

  const openMaps = () => {
    const q = encodeURIComponent(`${deal.shop} ${deal.address}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => Alert.alert("Couldn't open maps"));
  };

  const cancel = () =>
    Alert.alert("Cancel this order?", "The plates go back to the store.", [
      { text: "Keep order", style: "cancel" },
      { text: "Cancel order", style: "destructive", onPress: () => cancelOrder(order.id) },
    ]);

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      {topBar}
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={[s.hero, { backgroundColor: hero.bg }]}>
          <View style={s.heroCircle} />
          <Ionicons name={hero.icon} size={34} color={hero.fg} />
          <Text style={[s.heroTitle, { color: hero.fg }]}>{hero.title}</Text>
          <Text style={[s.heroSub, { color: hero.fg }]}>{hero.sub}</Text>

          {confirmed && (
            <View style={s.codeRow}>
              {String(order.otp).split("").map((d, i) => (
                <View key={i} style={s.codeBox}>
                  <Text style={s.codeText}>{d}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[s.card, softShadow]}>
          <View style={s.row}>
            <View style={s.iconBox}>
              <Ionicons name="storefront-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>{deal.shop}</Text>
              <Text style={s.sub}>{deal.address}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <View style={s.iconBox}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>Today, {deal.pickupStart} – {deal.pickupEnd}</Text>
              {confirmed && left !== null && (
                <Text style={[s.sub, left <= 30 && { color: colors.primary, fontWeight: "700" }]}>
                  {left > 0 ? `Closes in ${formatLeft(left)}` : "Pickup time is over"}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={[s.card, softShadow, { marginTop: 14 }]}>
          <View style={s.row}>
            <Plate deal={deal} size={60} />
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle} numberOfLines={2}>{deal.name}</Text>
              <Text style={s.sub}>{order.qty} plate{order.qty > 1 ? "s" : ""} · ₹{order.total}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.sumRow}>
            <Text style={s.sub}>Order ID</Text>
            <Text style={s.sumValue}>#{order.id}</Text>
          </View>
          <View style={s.sumRow}>
            <Text style={s.sub}>You saved</Text>
            <Text style={[s.sumValue, { color: colors.success }]}>₹{order.saved}</Text>
          </View>
        </View>

        <Pressable style={s.outlineBtn} onPress={openMaps}>
          <Ionicons name="navigate-outline" size={18} color={colors.primary} />
          <Text style={s.outlineText}>Get directions</Text>
        </Pressable>

        {confirmed ? (
          <Pressable onPress={cancel} style={{ alignSelf: "center", marginTop: 18 }} hitSlop={10}>
            <Text style={s.cancelText}>Cancel order</Text>
          </Pressable>
        ) : (
          <Pressable style={s.primaryBtn} onPress={toOrders}>
            <Text style={s.primaryText}>Back to orders</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 },
  roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  missing: { textAlign: "center", color: colors.textMuted, marginTop: 40 },
  content: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 6 },

  hero: { borderRadius: 26, padding: 22, alignItems: "center", marginBottom: 16, overflow: "hidden" },
  heroCircle: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.12)", right: -60, top: -80 },
  heroTitle: { fontSize: 20, fontWeight: "800", marginTop: 8 },
  heroSub: { fontSize: 13, marginTop: 4, opacity: 0.9, textAlign: "center" },
  codeRow: { flexDirection: "row", gap: 8, marginTop: 20 },
  codeBox: { width: 44, height: 56, borderRadius: 14, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  codeText: { fontSize: 26, fontWeight: "800", color: colors.text },

  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  sumRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  sumValue: { fontSize: 14, fontWeight: "700", color: colors.text },

  outlineBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 16, height: 52, marginTop: 18, backgroundColor: colors.surface },
  outlineText: { color: colors.primary, fontWeight: "800", fontSize: 15 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 16, height: 52, alignItems: "center", justifyContent: "center", marginTop: 12 },
  primaryText: { color: colors.onPrimary, fontWeight: "800", fontSize: 15 },
  cancelText: { color: colors.danger, fontWeight: "700", fontSize: 14 },
});