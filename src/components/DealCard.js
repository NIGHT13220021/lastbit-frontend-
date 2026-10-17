import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import { Plate } from "./Plate";
import { minutesLeft } from "../utils/time";

function VegMark({ veg }) {
  const c = veg ? colors.success : colors.danger;
  return (
    <View style={[s.vegBox, { borderColor: c }]}>
      <View style={[s.vegDot, { backgroundColor: c }]} />
    </View>
  );
}

function timeText(mins) {
  if (mins == null) return "Today";
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m left`;
  return `${mins} min left`;
}

export default function DealCard({ deal, now, width, saved, onPress, onToggleSave }) {
  const left = minutesLeft(deal, new Date(now));
  const off = deal.original > deal.price ? Math.round(((deal.original - deal.price) / deal.original) * 100) : 0;
  const urgent = left != null && left <= 60;
  const imgH = Math.round(width * 0.8);

  return (
    <Pressable onPress={onPress} style={[s.card, { width }]}>
      <View>
        <View style={[s.img, { height: imgH }]}>
          <Plate deal={deal} size={Math.min(Math.round(width * 0.6), 112)} />

          {off > 0 && (
            <View style={s.offTag}>
              <Text style={s.offText}>{off}% OFF</Text>
            </View>
          )}

          <Pressable style={s.heart} onPress={onToggleSave} hitSlop={8}>
            <Ionicons name={saved ? "heart" : "heart-outline"} size={18} color={saved ? colors.heart : colors.text} />
          </Pressable>
        </View>

        {/* overlapping badge, like the rating chip on Zomato */}
        <View style={[s.timeBadge, { backgroundColor: urgent ? colors.primary : colors.success }]}>
          <Ionicons name="timer-outline" size={12} color={colors.onPrimary} />
          <Text style={s.timeText}>{timeText(left)}</Text>
        </View>
      </View>

      <View style={s.body}>
        <View style={s.nameRow}>
          <VegMark veg={deal.veg} />
          <Text style={s.name} numberOfLines={1}>{deal.name}</Text>
        </View>
        <Text style={s.shop} numberOfLines={1}>{deal.shop}</Text>

        <View style={s.priceRow}>
          <Text style={s.price}>₹{deal.price}</Text>
          {deal.original > deal.price && <Text style={s.original}>₹{deal.original}</Text>}
        </View>

        <View style={s.metaRow}>
          <Ionicons name="navigate-outline" size={13} color={colors.textMuted} />
          <Text style={s.meta}>{deal.distanceKm} km</Text>
          {deal.stock <= 3 && <Text style={s.low}>Only {deal.stock} left</Text>}
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { marginBottom: 22 },
  img: { borderRadius: 16, backgroundColor: colors.cardAlt, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  offTag: { position: "absolute", top: 8, left: 8, backgroundColor: "rgba(28,28,28,0.82)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  offText: { color: colors.onPrimary, fontSize: 12, fontWeight: "800", letterSpacing: 0.2 },
  heart: { position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" },
  timeBadge: { position: "absolute", left: 8, bottom: -12, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.surface },
  timeText: { color: colors.onPrimary, fontSize: 11, fontWeight: "800" },
  body: { paddingTop: 20, paddingHorizontal: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.text, letterSpacing: -0.2 },
  vegBox: { width: 14, height: 14, borderWidth: 1.5, borderRadius: 3, alignItems: "center", justifyContent: "center" },
  vegDot: { width: 6, height: 6, borderRadius: 3 },
  shop: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 8 },
  price: { fontSize: 16, fontWeight: "800", color: colors.text },
  original: { fontSize: 12, color: colors.textMuted, textDecorationLine: "line-through" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  meta: { fontSize: 12, color: colors.textMuted, fontWeight: "500" },
  low: { marginLeft: 8, fontSize: 12, fontWeight: "700", color: colors.primary },
});