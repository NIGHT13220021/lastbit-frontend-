import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "../components/AppText";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors, { shadow, softShadow } from "../theme/colors";
import { useDeals } from "../store/DealsContext";
import { Plate, categoryLook } from "../components/Plate";
import { minutesLeft, formatLeft } from "../utils/time";

export default function DealDetailsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { getDeal, isSaved, toggleSaved } = useDeals();
  const deal = getDeal(route.params?.dealId);
  const [qty, setQty] = useState(1);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  if (!deal) {
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <View style={s.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={s.roundBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        </View>
        <Text style={s.missing}>This deal is no longer available.</Text>
      </SafeAreaView>
    );
  }

  const look = categoryLook(deal.category);
  const left = minutesLeft(deal, new Date(now));
  const ended = left !== null && left <= 0;
  const soldOut = deal.stock < 1;
  const unavailable = ended || soldOut;
  const maxQty = Math.max(1, Math.min(deal.stock, 5));
  const off = deal.original > deal.price ? Math.round((1 - deal.price / deal.original) * 100) : 0;
  const saving = (deal.original - deal.price) * qty;
  const urgent = left !== null && left <= 30;
  const saved = isSaved(deal.id);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={[s.roundBtn, softShadow]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={s.topTitle}>Details</Text>
        <Pressable onPress={() => toggleSaved(deal.id)} style={[s.roundBtn, softShadow]}>
          <Ionicons name={saved ? "heart" : "heart-outline"} size={20} color={saved ? colors.primary : colors.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        <View style={s.hero}>
          <View style={[s.heroBg, { backgroundColor: look.tint }]} />
          <Plate deal={deal} size={210} />
        </View>

        <View style={s.sheet}>
          <View style={s.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{deal.name}</Text>
              <Text style={s.shop}>{deal.shop} · {deal.distanceKm} km</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.price}>₹{deal.price}</Text>
              <Text style={s.original}>₹{deal.original}</Text>
            </View>
          </View>

          <View style={s.chips}>
            {deal.rating != null && (
              <View style={[s.chip, { backgroundColor: colors.ratingSoft }]}>
                <Ionicons name="star" size={14} color={colors.rating} />
                <Text style={s.chipText}>{deal.rating}</Text>
              </View>
            )}
            <View style={[s.chip, { backgroundColor: urgent ? colors.primarySoft : colors.field }]}>
              <Ionicons name="time-outline" size={14} color={urgent ? colors.primary : colors.textMuted} />
              <Text style={[s.chipText, urgent && { color: colors.primary }]}>
                {left === null ? `Till ${deal.pickupEnd}` : ended ? "Ended" : `Closes in ${formatLeft(left)}`}
              </Text>
            </View>
            <View style={[s.chip, { backgroundColor: colors.field }]}>
              <Ionicons name="restaurant-outline" size={14} color={colors.textMuted} />
              <Text style={s.chipText}>{deal.stock} plate{deal.stock === 1 ? "" : "s"} left</Text>
            </View>
          </View>

          {!!deal.description && (
            <>
              <Text style={s.section}>Details</Text>
              <Text style={s.body}>{deal.description}</Text>
            </>
          )}

          {off > 0 && (
            <View style={s.saveBox}>
              <Ionicons name="pricetag" size={18} color={colors.success} />
              <Text style={s.saveText}>You save ₹{saving} ({off}% off)</Text>
            </View>
          )}

          <Text style={s.section}>Pickup from</Text>
          <View style={[s.pickup, softShadow]}>
            <View style={s.pickupRow}>
              <View style={s.pickupIcon}>
                <Ionicons name="storefront-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.pickupTitle}>{deal.shop}</Text>
                <Text style={s.pickupSub}>{deal.address}</Text>
              </View>
            </View>
            <View style={s.divider} />
            <View style={s.pickupRow}>
              <View style={s.pickupIcon}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.pickupTitle}>Today, {deal.pickupStart} – {deal.pickupEnd}</Text>
                <Text style={s.pickupSub}>Collect within {deal.holdMin ?? 30} min of reserving</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[s.footer, shadow, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={s.stepper}>
          <Pressable style={s.stepBtn} onPress={() => setQty((q) => Math.max(1, q - 1))} disabled={unavailable}>
            <Ionicons name="remove" size={18} color={colors.text} />
          </Pressable>
          <Text style={s.stepText}>{qty}</Text>
          <Pressable style={s.stepBtn} onPress={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={unavailable}>
            <Ionicons name="add" size={18} color={colors.text} />
          </Pressable>
        </View>
        <Pressable
          style={[s.cta, unavailable && { backgroundColor: colors.textMuted }]}
          disabled={unavailable}
          onPress={() => navigation.navigate("Checkout", { dealId: deal.id, qty })}
        >
          <Text style={s.ctaText}>{ended ? "Deal ended" : soldOut ? "Sold out" : `Reserve · ₹${deal.price * qty}`}</Text>
        </Pressable>
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

  hero: { alignItems: "center", justifyContent: "center", paddingTop: 14, paddingBottom: 46 },
  heroBg: { position: "absolute", width: 290, height: 290, borderRadius: 145, opacity: 0.7 },

  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -26, padding: 24, minHeight: 460 },
  titleRow: { flexDirection: "row", gap: 12 },
  name: { fontSize: 22, fontWeight: "800", color: colors.text, lineHeight: 28 },
  shop: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
  price: { fontSize: 24, fontWeight: "800", color: colors.primary },
  original: { fontSize: 13, color: colors.textMuted, textDecorationLine: "line-through", marginTop: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 12 },
  chipText: { fontSize: 12, fontWeight: "700", color: colors.text },
  section: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 22, marginBottom: 8 },
  body: { fontSize: 14, color: colors.textMuted, lineHeight: 21 },
  saveBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.successSoft, borderRadius: 14, padding: 14, marginTop: 18 },
  saveText: { fontSize: 14, fontWeight: "800", color: colors.success },
  pickup: { backgroundColor: colors.surface, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: colors.border },
  pickupRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  pickupIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  pickupTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
  pickupSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },

  footer: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 16, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 14 },
  stepper: { flexDirection: "row", alignItems: "center", backgroundColor: colors.field, borderRadius: 16, padding: 4 },
  stepBtn: { width: 36, height: 40, alignItems: "center", justifyContent: "center" },
  stepText: { minWidth: 24, textAlign: "center", fontSize: 16, fontWeight: "800", color: colors.text },
  cta: { flex: 1, height: 52, borderRadius: 16, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  ctaText: { color: colors.onPrimary, fontSize: 16, fontWeight: "800" },
});