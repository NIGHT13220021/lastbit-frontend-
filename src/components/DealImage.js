import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "./AppText";
import colors from "../theme/colors";

// Shows the food photo; if the photo can't load (offline), the emoji underneath stays visible.
export default function DealImage({ uri, emoji, style }) {
  return (
    <View style={[styles.box, style]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  emoji: { fontSize: 56 },
});
