import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "../components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors, { softShadow } from "../theme/colors";
import { useDeals } from "../store/DealsContext";
import { Plate } from "../components/Plate";

export default function StoreMenuScreen({ navigation }) {
  const { menu, removeMenuItem } = useDeals();

  const confirmRemove = (item) =>
    Alert.alert("Remove from menu?", item.name, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeMenuItem(item.id) },
    ]);

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <View style={s.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={[s.roundBtn, softShadow]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={s.title}>My menu</Text>
        <Pressable onPress={() => navigation.navigate("MenuItemForm")} style={[s.roundBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {menu.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <Ionicons name="restaurant-outline" size={34} color={colors.primary} />
            </View>
            <Text style={s.emptyTitle}>Add your dishes once</Text>
            <Text style={s.emptyText}>Save each dish with its photo and usual price. After that, posting a leftover takes one tap.</Text>
            <Pressable style={s.primaryBtn} onPress={() => navigation.navigate("MenuItemForm")}>
              <Text style={s.primaryText}>Add first dish</Text>
            </Pressable>
          </View>
        ) : (
          menu.map((item) => (
            <Pressable key={item.id} style={[s.card, softShadow]} onPress={() => navigation.navigate("MenuItemForm", { itemId: item.id })}>
              <Plate deal={item} size={62} />
              <View style={{ flex: 1 }}>
                <Text style={s.name} numberOfLines={1}>{item.name}</Text>
                <Text style={s.meta}>{item.category} · {item.veg ? "Veg" : "Non-veg"}</Text>
                <Text style={s.price}>₹{item.price}</Text>
              </View>
              <Pressable onPress={() => confirmRemove(item)} hitSlop={10} style={s.trash}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 },
  roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "800", color: colors.text },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 30 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface, borderRadius: 20, padding: 12, marginBottom: 12 },
  name: { fontSize: 15, fontWeight: "800", color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  price: { fontSize: 14, fontWeight: "800", color: colors.primary, marginTop: 4 },
  trash: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.dangerSoft, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingTop: 50, paddingHorizontal: 20 },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 16 },
  emptyText: { fontSize: 13, color: colors.textMuted, textAlign: "center", marginTop: 8, lineHeight: 19 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, marginTop: 22 },
  primaryText: { color: colors.onPrimary, fontWeight: "800", fontSize: 15 },
});