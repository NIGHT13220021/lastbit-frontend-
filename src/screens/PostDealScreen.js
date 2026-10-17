import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput } from "../components/AppText";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors, { shadow, softShadow } from "../theme/colors";
import { useDeals } from "../store/DealsContext";
import { Plate } from "../components/Plate";
import { clockIn, minutesLeft } from "../utils/time";

const OFFS = [30, 40, 50, 60];
const WINDOWS = [
  [30, "30 min"],
  [60, "1 hour"],
  [120, "2 hours"],
  ["closing", "Till closing"],
  ["custom", "Custom"],
];
const HOLDS = [15, 30, 45];
const round5 = (n) => Math.max(5, Math.round(n / 5) * 5);

export default function PostDealScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { store, menu, addDeal } = useDeals();

  const [selectedId, setSelectedId] = useState(null);
  const [off, setOff] = useState(50);
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState(3);
  const [win, setWin] = useState(60);
  const [custom, setCustom] = useState("45");
  const [hold, setHold] = useState(30);
  const [fresh, setFresh] = useState(false);

  const item = menu.find((m) => m.id === selectedId);
  const p = Number(price);
  const shownOff = item && p > 0 && p < item.price ? Math.round((1 - p / item.price) * 100) : 0;

  const pick = (m) => {
    setSelectedId(m.id);
    setOff(50);
    setPrice(String(round5(m.price * 0.5)));
  };

  const applyOff = (o) => {
    setOff(o);
    if (item) setPrice(String(round5(item.price * (1 - o / 100))));
  };

  // pickup window: starts now, ends at closing time (or 1 / 2 hours from now, never after closing)
  const startStr = clockIn(-5);
  const toClose = store?.closing ? minutesLeft({ pickupStart: startStr, pickupEnd: store.closing }) : null;
  const winMin = win === "custom" ? Math.min(180, Math.max(5, Number(custom) || 0)) : win;
  const endStr =
    win === "closing"
      ? store?.closing ?? clockIn(120)
      : toClose !== null && winMin >= toClose
      ? store.closing
      : clockIn(winMin);

  const submit = () => {
    if (!item) return Alert.alert("Pick a dish from your menu");
    if (!(p > 0) || p >= item.price) return Alert.alert("Deal price must be lower than the menu price", `Menu price is ₹${item.price}.`);
    if (toClose !== null && toClose <= 0) return Alert.alert("Closing time is over", `Your store closed at ${store.closing}.`);
    if (!fresh) return Alert.alert("Confirm the food is fresh", "Only food cooked today and not reheated can be sold.");

    addDeal({
      name: item.name,
      shop: store?.name ?? "My store",
      address: store?.address,
      category: item.category,
      veg: item.veg,
      original: item.price,
      price: p,
      stock: qty,
      image: item.image ?? null,
      menuId: item.id,
      pickupStart: startStr,
      pickupEnd: endStr,
      description: "Cooked today. Packed fresh at pickup.",
      holdMin: hold,
    });
    Alert.alert("Deal is live", "Nearby customers can reserve it now.", [{ text: "Done", onPress: () => navigation.goBack() }]);
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={[s.roundBtn, softShadow]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={s.title}>Post a deal</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* 1. dish */}
        <Text style={s.section}>What's left today?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.menuScroll} contentContainerStyle={s.menuContent}>
          {menu.map((m) => {
            const on = m.id === selectedId;
            return (
              <Pressable key={m.id} style={[s.dish, softShadow, on && s.dishOn]} onPress={() => pick(m)}>
                <Plate deal={m} size={64} />
                <Text style={s.dishName} numberOfLines={2}>{m.name}</Text>
                <Text style={s.dishPrice}>₹{m.price}</Text>
                {on && (
                  <View style={s.tick}>
                    <Ionicons name="checkmark" size={13} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
          <Pressable style={[s.dish, s.newDish]} onPress={() => navigation.navigate("MenuItemForm")}>
            <View style={s.newIcon}>
              <Ionicons name="add" size={28} color={colors.primary} />
            </View>
            <Text style={[s.dishName, { color: colors.primary }]}>New dish</Text>
          </Pressable>
        </ScrollView>

        {menu.length === 0 && <Text style={s.hint}>Add your dishes once with a photo. Next time you only pick and post.</Text>}

        {item && (
          <>
            {/* 2. price */}
            <Text style={s.section}>Deal price</Text>
            <View style={[s.card, softShadow]}>
              <View style={s.offRow}>
                {OFFS.map((o) => (
                  <Pressable key={o} style={[s.offPill, off === o && s.offPillOn]} onPress={() => applyOff(o)}>
                    <Text style={[s.offText, off === o && { color: colors.onPrimary }]}>{o}% off</Text>
                  </Pressable>
                ))}
              </View>
              <View style={s.priceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Customers pay (₹)</Text>
                  <TextInput
                    value={price}
                    onChangeText={(t) => {
                      setPrice(t.replace(/\D/g, ""));
                      setOff(null);
                    }}
                    keyboardType="number-pad"
                    style={s.priceInput}
                  />
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={s.original}>Menu price ₹{item.price}</Text>
                  {shownOff > 0 && <Text style={s.offBig}>{shownOff}% off</Text>}
                </View>
              </View>
            </View>

            {/* 3. plates */}
            <Text style={s.section}>How many plates?</Text>
            <View style={s.stepper}>
              <Pressable style={s.stepBtn} onPress={() => setQty((q) => Math.max(1, q - 1))}>
                <Ionicons name="remove" size={20} color={colors.text} />
              </Pressable>
              <Text style={s.stepText}>{qty}</Text>
              <Pressable style={s.stepBtn} onPress={() => setQty((q) => q + 1)}>
                <Ionicons name="add" size={20} color={colors.text} />
              </Pressable>
            </View>

            {/* 4. pickup window */}
            <Text style={s.section}>Deal stays live for</Text>
            <View style={s.offRow}>
              {WINDOWS.map(([key, label]) => (
                <Pressable key={String(key)} style={[s.offPill, win === key && s.offPillOn]} onPress={() => setWin(key)}>
                  <Text style={[s.offText, win === key && { color: colors.onPrimary }]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            {win === "custom" && (
              <View style={s.customRow}>
                <TextInput
                  value={custom}
                  onChangeText={(t) => setCustom(t.replace(/\D/g, "").slice(0, 3))}
                  keyboardType="number-pad"
                  style={s.customInput}
                />
                <Text style={s.customLabel}>minutes (max 180)</Text>
              </View>
            )}
            <View style={s.timeBox}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={s.timeText}>Today, {startStr} – {endStr}</Text>
            </View>

            <Text style={s.section}>Customer must collect within</Text>
            <View style={s.offRow}>
              {HOLDS.map((m) => (
                <Pressable key={m} style={[s.offPill, hold === m && s.offPillOn]} onPress={() => setHold(m)}>
                  <Text style={[s.offText, hold === m && { color: colors.onPrimary }]}>{m} min</Text>
                </Pressable>
              ))}
            </View>
            <Text style={s.hintSmall}>After reserving, the order is cancelled if the customer doesn't arrive in time, and the plates go back on sale.</Text>

            <Pressable style={s.checkRow} onPress={() => setFresh((v) => !v)}>
              <View style={[s.box, fresh && s.boxOn]}>{fresh && <Ionicons name="checkmark" size={16} color="#fff" />}</View>
              <Text style={s.checkText}>This food was cooked today and has not been reheated.</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <View style={[s.footer, shadow, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Pressable style={[s.cta, !item && { backgroundColor: colors.textMuted }]} onPress={submit}>
          <Text style={s.ctaText}>{item ? `Post ${item.name}` : "Pick a dish to post"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 },
  roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "800", color: colors.text },
  content: { paddingHorizontal: 20, paddingBottom: 130 },
  section: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 18, marginBottom: 10 },
  hint: { fontSize: 13, color: colors.textMuted, marginTop: 4 },

  menuScroll: { marginHorizontal: -20, flexGrow: 0 },
  menuContent: { gap: 12, paddingHorizontal: 20, paddingVertical: 8 },
  dish: { width: 112, alignItems: "center", backgroundColor: colors.surface, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 8, borderWidth: 2, borderColor: "transparent" },
  dishOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  dishName: { fontSize: 12, fontWeight: "800", color: colors.text, textAlign: "center", marginTop: 10, minHeight: 30 },
  dishPrice: { fontSize: 12, fontWeight: "700", color: colors.textMuted, marginTop: 2 },
  tick: { position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  newDish: { backgroundColor: "transparent", borderColor: colors.primary, borderStyle: "dashed", justifyContent: "center" },
  newIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },

  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 14 },
  offRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  offPill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  offPillOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  offText: { fontSize: 13, fontWeight: "700", color: colors.text },
  priceRow: { flexDirection: "row", alignItems: "flex-end", gap: 12, marginTop: 16 },
  label: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  priceInput: { height: 52, borderRadius: 14, backgroundColor: colors.field, paddingHorizontal: 14, fontSize: 22, fontWeight: "800", color: colors.primary },
  original: { fontSize: 12, color: colors.textMuted },
  offBig: { fontSize: 16, fontWeight: "800", color: colors.success, marginTop: 4 },

  stepper: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: colors.surface, borderRadius: 18, padding: 5, gap: 4 },
  stepBtn: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.field, alignItems: "center", justifyContent: "center" },
  stepText: { minWidth: 44, textAlign: "center", fontSize: 20, fontWeight: "800", color: colors.text },

  timeBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.primarySoft, borderRadius: 14, padding: 14, marginTop: 12 },
  timeText: { fontSize: 14, fontWeight: "800", color: colors.text },

  customRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  customInput: { width: 90, height: 46, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, textAlign: "center", fontSize: 18, fontWeight: "800", color: colors.text },
  customLabel: { fontSize: 13, color: colors.textMuted },
  hintSmall: { fontSize: 12, color: colors.textMuted, marginTop: 8, lineHeight: 17 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20 },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 18 },

  footer: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 16, paddingHorizontal: 20 },
  cta: { height: 54, borderRadius: 16, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  ctaText: { color: colors.onPrimary, fontSize: 16, fontWeight: "800" },
});