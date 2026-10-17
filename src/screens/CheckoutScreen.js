import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "../components/AppText";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors, { shadow, softShadow } from "../theme/colors";
import { useDeals } from "../store/DealsContext";
import { Plate } from "../components/Plate";
import { minutesLeft } from "../utils/time";

const METHODS = [
  ["upi", "UPI", "phone-portrait-outline", "Pay with any UPI app"],
  ["card", "Credit / debit card", "card-outline", "Visa, Mastercard, RuPay"],
  ["cash", "Pay at pickup", "cash-outline", "Pay the store directly"],
];

export default function CheckoutScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { getDeal, reserve } = useDeals();
  const deal = getDeal(route.params?.dealId);
  const qty = route.params?.qty ?? 1;
  const [method, setMethod] = useState("upi");
  const [busy, setBusy] = useState(false);

  const back = (
    <View style={s.topBar}>
      <Pressable onPress={() => navigation.goBack()} style={[s.roundBtn, softShadow]}>
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={s.topTitle}>Order summary</Text>
      <View style={{ width: 42 }} />
    </View>
  );

  if (!deal) {
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        {back}
        <Text style={s.missing}>This deal is no longer available.</Text>
      </SafeAreaView>
    );
  }

  const subtotal = deal.original * qty;
  const total = deal.price * qty;
  const saving = subtotal - total;

  const place = () => {
    if (busy) return;
    if ((minutesLeft(deal) ?? 1) <= 0) {
      Alert.alert("Deal ended", "The pickup time for this deal is over.", [{ text: "OK", onPress: () => navigation.popToTop() }]);
      return;
    }
    setBusy(true);
    const res = reserve(deal.id, qty);
    if (!res.ok) {
      setBusy(false);
      Alert.alert("Couldn't reserve", res.error, [{ text: "OK", onPress: () => navigation.goBack() }]);
      return;
    }
    navigation.replace("Pickup", { orderId: res.order.id });
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {back}
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* order */}
        <View style={[s.card, softShadow]}>
          <View style={s.orderRow}>
            <Plate deal={deal} size={64} />
            <View style={{ flex: 1 }}>
              <Text style={s.name} numberOfLines={2}>{deal.name}</Text>
              <Text style={s.sub}>{deal.shop}</Text>
            </View>
            <View style={s.qtyTag}>
              <Text style={s.qtyText}>x{qty}</Text>
            </View>
          </View>
        </View>

        {/* pickup */}
        <Text style={s.section}>Pickup from</Text>
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
              <Text style={s.sub}>Collect within {deal.holdMin ?? 30} min of placing the order</Text>
            </View>
          </View>
        </View>

        {/* payment */}
        <Text style={s.section}>Payment method</Text>
        {METHODS.map(([key, label, icon, hint]) => {
          const on = method === key;
          return (
            <Pressable key={key} onPress={() => setMethod(key)} style={[s.method, softShadow, on && s.methodOn]}>
              <View style={s.iconBox}>
                <Ionicons name={icon} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>{label}</Text>
                <Text style={s.sub}>{hint}</Text>
              </View>
              <View style={[s.radio, on && s.radioOn]}>{on && <View style={s.radioDot} />}</View>
            </Pressable>
          );
        })}

        {/* totals */}
        <Text style={s.section}>Order info</Text>
        <View style={[s.card, softShadow]}>
          <View style={s.sumRow}>
            <Text style={s.sumLabel}>Original price</Text>
            <Text style={s.sumValue}>₹{subtotal}</Text>
          </View>
          <View style={s.sumRow}>
            <Text style={s.sumLabel}>You save</Text>
            <Text style={[s.sumValue, { color: colors.success }]}>-₹{saving}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.sumRow}>
            <Text style={s.totalLabel}>Total amount</Text>
            <Text style={s.totalValue}>₹{total}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[s.footerWrap, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={[s.footer, shadow]}>
          <View style={s.totalBlock}>
            <Text style={s.totalSmall}>Total</Text>
            <Text style={s.totalBig}>₹{total}</Text>
          </View>
          <Pressable style={[s.cta, busy && { opacity: 0.6 }]} onPress={place} disabled={busy}>
            <Text style={s.ctaText}>Place order</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 },
  roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  missing: { textAlign: "center", color: colors.textMuted, marginTop: 40 },
  content: { paddingHorizontal: 20, paddingBottom: 130 },
  section: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 14 },
  orderRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  name: { fontSize: 15, fontWeight: "800", color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  qtyTag: { backgroundColor: colors.primarySoft, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  qtyText: { color: colors.primary, fontWeight: "800", fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  method: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: "transparent" },
  methodOn: { borderColor: colors.primary },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },
  sumRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  sumLabel: { fontSize: 14, color: colors.textMuted },
  sumValue: { fontSize: 14, fontWeight: "700", color: colors.text },
  totalLabel: { fontSize: 15, fontWeight: "800", color: colors.text },
  totalValue: { fontSize: 18, fontWeight: "800", color: colors.primary },

  footerWrap: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 10, backgroundColor: colors.bg },
  footer: { flexDirection: "row", borderRadius: 20, overflow: "hidden", backgroundColor: colors.surface },
  totalBlock: { paddingHorizontal: 18, paddingVertical: 10, justifyContent: "center", backgroundColor: colors.field },
  totalSmall: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  totalBig: { fontSize: 20, fontWeight: "800", color: colors.text },
  cta: { flex: 1, height: 58, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  ctaText: { color: colors.onPrimary, fontSize: 16, fontWeight: "800" },
});