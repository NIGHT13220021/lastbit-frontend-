import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "./AppText";
import colors, { softShadow } from "../theme/colors";

const LOOK = {
  All: { emoji: "🍽️", tint: "#F0F1F6" },
  Meals: { emoji: "🍛", tint: "#FFF1E0" },
  Snacks: { emoji: "🥟", tint: "#FFF8D6" },
  "Sweets & Dessert": { emoji: "🍮", tint: "#FDE8EF" },
  Drinks: { emoji: "🥤", tint: "#E4F2FF" },
};

export function categoryLook(category) {
  return LOOK[category] || { emoji: "🍽️", tint: colors.primarySoft };
}

// A round "plate" with the dish on it. Uses deal.image when there is one, otherwise a category emoji.
export function Plate({ deal, size = 96 }) {
  const look = categoryLook(deal?.category);
  const inner = Math.round(size * 0.78);
  const hasImage = typeof deal?.image === "string" && deal.image.length > 0;

  return (
    <View style={[s.outer, softShadow, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[s.inner, { width: inner, height: inner, borderRadius: inner / 2, backgroundColor: look.tint }]}>
        {hasImage ? (
          <Image source={{ uri: deal.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: Math.round(inner * 0.52) }}>{deal?.emoji || look.emoji}</Text>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  outer: { backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  inner: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
});