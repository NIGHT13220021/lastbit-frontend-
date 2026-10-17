import React, { useEffect } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "../components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import { useDeals } from "../store/DealsContext";
import { minutesLeft } from "../utils/time";

export default function StoreDashboardScreen({ navigation }) {
  const { store, menu, deals, orders, updateDeal, removeDeal, getDeal } = useDeals();

  // only verified stores can be here
  useEffect(() => {
    if (store?.status !== "verified") navigation.replace("StoreOnboarding");
  }, [store, navigation]);

  const mine = deals.filter((d) => d.isMine);
  const waiting = orders.filter((o) => o.status === "confirmed" && getDeal(o.dealId)?.isMine);
  const bagsLeft = mine.reduce((n, d) => n + (d.stock || 0), 0);

  const endDeal = (deal) => {
    if (waiting.some((o) => o.dealId === deal.id)) {
      Alert.alert("Pending pickups", "Hand over the reserved bags before ending this deal.");
      return;
    }
    Alert.alert("End this deal?", deal.name, [
      { text: "Cancel", style: "cancel" },
      { text: "End deal", style: "destructive", onPress: () => removeDeal(deal.id) },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{store?.name}</Text>
          <Text style={s.sub} numberOfLines={1}>{store?.type} · closes {store?.closing}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.statsRow}>
          <View style={s.stat}><Text style={s.statNum}>{mine.length}</Text><Text style={s.statLabel}>live deals</Text></View>
          <View style={s.stat}><Text style={s.statNum}>{bagsLeft}</Text><Text style={s.statLabel}>plates left</Text></View>
          <View style={s.stat}><Text style={s.statNum}>{waiting.length}</Text><Text style={s.statLabel}>to hand over</Text></View>
        </View>

        <View style={s.actions}>
          <Pressable style={[s.actionBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate("PostDeal")}>
            <Ionicons name="add-circle-outline" size={20} color={colors.onPrimary} />
            <Text style={[s.actionText, { color: colors.onPrimary }]}>Post a deal</Text>
          </Pressable>
          <Pressable style={[s.actionBtn, s.actionOutline]} onPress={() => navigation.navigate("VerifyPickup")}>
            <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
            <Text style={[s.actionText, { color: colors.primary }]}>Verify pickup</Text>
          </Pressable>
        </View>

        <Pressable style={s.menuCard} onPress={() => navigation.navigate("StoreMenu")}>
          <View style={s.menuIcon}>
            <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.menuTitle}>My menu</Text>
            <Text style={s.menuSub}>
              {menu.length ? `${menu.length} dish${menu.length > 1 ? "es" : ""} saved with photos` : "Add your dishes once, then post in one tap"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Text style={s.section}>Your deals</Text>
        {mine.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="storefront-outline" size={44} color={colors.border} />
            <Text style={s.emptyTitle}>No live deals</Text>
            <Text style={s.emptyText}>Post your surplus food and nearby customers can reserve it.</Text>
          </View>
        )}
        {mine.map((d) => (
          <View key={d.id} style={s.card}>
            <View style={s.cardTop}>
              <Text style={s.cardName} numberOfLines={1}>{d.name}</Text>
              <Text style={s.price}>₹{d.price} <Text style={s.original}>₹{d.original}</Text></Text>
            </View>
            <Text style={s.meta}>{d.category} · {d.veg ? "Veg" : "Non-veg"} · Pickup {d.pickupStart} – {d.pickupEnd}</Text>
            <View style={s.cardBottom}>
              <View style={s.stepper}>
                <Pressable style={s.stepBtn} onPress={() => updateDeal(d.id, { stock: Math.max(0, (d.stock || 0) - 1) })}>
                  <Ionicons name="remove" size={18} color={colors.text} />
                </Pressable>
                <Text style={s.stepText}>{(minutesLeft(d) ?? 1) <= 0 ? "Ended" : d.stock > 0 ? `${d.stock} left` : "Sold out"}</Text>
                <Pressable style={s.stepBtn} onPress={() => updateDeal(d.id, { stock: (d.stock || 0) + 1 })}>
                  <Ionicons name="add" size={18} color={colors.text} />
                </Pressable>
              </View>
              <Pressable onPress={() => endDeal(d)} hitSlop={8}>
                <Text style={s.endText}>End deal</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {waiting.length > 0 && <Text style={[s.section, { marginTop: 8 }]}>Waiting for pickup</Text>}
        {waiting.map((o) => (
          <View key={o.id} style={s.card}>
            <Text style={s.cardName}>{getDeal(o.dealId)?.name}</Text>
            <Text style={s.meta}>Order #{o.id} · {o.qty} plate{o.qty > 1 ? "s" : ""} · ₹{o.total}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  stat: { flex: 1, backgroundColor: colors.primarySoft, borderRadius: 14, padding: 14 },
  statNum: { fontSize: 22, fontWeight: "800", color: colors.primary },
  statLabel: { fontSize: 12, color: colors.primary, marginTop: 2 },
  actions: { flexDirection: "row", gap: 10, marginBottom: 22 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14 },
  actionOutline: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.surface },
  actionText: { fontSize: 14, fontWeight: "800" },
  menuCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 22, borderWidth: 1, borderColor: colors.border },
  menuIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  menuTitle: { fontSize: 15, fontWeight: "800", color: colors.text },
  menuSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  section: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  cardName: { flex: 1, fontSize: 16, fontWeight: "800", color: colors.text },
  price: { fontSize: 15, fontWeight: "800", color: colors.primary },
  original: { fontSize: 12, color: colors.textMuted, textDecorationLine: "line-through", fontWeight: "500" },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  stepText: { fontSize: 14, fontWeight: "700", color: colors.text, minWidth: 64, textAlign: "center" },
  endText: { fontSize: 13, fontWeight: "700", color: colors.danger },
  empty: { alignItems: "center", paddingVertical: 30, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: colors.text, marginTop: 10 },
  emptyText: { fontSize: 13, color: colors.textMuted, textAlign: "center", marginTop: 6 },
});