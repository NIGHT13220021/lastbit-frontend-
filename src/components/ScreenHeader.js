import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./AppText";
import colors from "../theme/colors";

export default function ScreenHeader({ title, onBack }) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} style={styles.back} hitSlop={10}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.back} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 26, color: colors.text, marginTop: -3 },
  title: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "800", color: colors.text, marginHorizontal: 8 },
});
