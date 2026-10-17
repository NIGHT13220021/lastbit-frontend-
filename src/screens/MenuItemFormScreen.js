import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput } from "../components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors, { softShadow } from "../theme/colors";
import { categories } from "../data/mockData";
import { COMMON_DISHES } from "../data/commonDishes";
import { useDeals } from "../store/DealsContext";
import { Plate } from "../components/Plate";
import { pickDishPhoto } from "../utils/pickImage";

export default function MenuItemFormScreen({ navigation, route }) {
  const { menu, addMenuItem, updateMenuItem } = useDeals();
  const editing = menu.find((m) => m.id === route.params?.itemId);
  const cats = categories.filter((c) => c !== "All");

  const [image, setImage] = useState(editing?.image ?? null);
  const [name, setName] = useState(editing?.name ?? "");
  const [category, setCategory] = useState(editing?.category ?? cats[0]);
  const [veg, setVeg] = useState(editing?.veg ?? true);
  const [price, setPrice] = useState(editing ? String(editing.price) : "");

  const onPhoto = async () => {
    const uri = await pickDishPhoto();
    if (uri) setImage(uri);
  };

  const fill = (d) => {
    setName(d.name);
    setCategory(d.category);
    setVeg(d.veg);
    setPrice(String(d.price));
  };

  const save = () => {
    const p = Number(price);
    if (!name.trim()) return Alert.alert("Enter the dish name");
    if (!(p > 0)) return Alert.alert("Enter the usual price");
    const data = { name: name.trim(), category, veg, price: p, image };
    if (editing) updateMenuItem(editing.id, data);
    else addMenuItem(data);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <View style={s.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={[s.roundBtn, softShadow]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={s.title}>{editing ? "Edit dish" : "Add a dish"}</Text>
        <View style={{ width: 42 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable style={s.photoWrap} onPress={onPhoto}>
            <Plate deal={{ category, image }} size={140} />
            <View style={s.camBadge}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </Pressable>
          <Text style={s.photoHint}>{image ? "Tap to change the photo" : "Add a photo (optional)"}</Text>

          {!editing && (
            <>
              <Text style={s.label}>Quick fill</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.sugScroll} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
                {COMMON_DISHES.map((d) => (
                  <Pressable key={d.name} style={s.sug} onPress={() => fill(d)}>
                    <Text style={s.sugText}>{d.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          <Text style={s.label}>Dish name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="e.g. Rajma chawal" placeholderTextColor={colors.textMuted} style={s.input} />

          <Text style={s.label}>Category</Text>
          <View style={s.wrap}>
            {cats.map((c) => (
              <Pressable key={c} style={[s.pill, category === c && s.pillOn]} onPress={() => setCategory(c)}>
                <Text style={[s.pillText, category === c && { color: colors.onPrimary }]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={s.label}>Food type</Text>
          <View style={s.row}>
            <Pressable style={[s.toggle, veg && s.toggleOn]} onPress={() => setVeg(true)}>
              <Text style={[s.toggleText, veg && { color: colors.onPrimary }]}>Veg</Text>
            </Pressable>
            <Pressable style={[s.toggle, !veg && s.toggleOn]} onPress={() => setVeg(false)}>
              <Text style={[s.toggleText, !veg && { color: colors.onPrimary }]}>Non-veg</Text>
            </Pressable>
          </View>

          <Text style={s.label}>Usual price (₹)</Text>
          <TextInput
            value={price}
            onChangeText={(t) => setPrice(t.replace(/\D/g, ""))}
            keyboardType="number-pad"
            placeholder="150"
            placeholderTextColor={colors.textMuted}
            style={s.input}
          />

          <Pressable style={s.save} onPress={save}>
            <Text style={s.saveText}>{editing ? "Save changes" : "Add to menu"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 },
  roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "800", color: colors.text },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  photoWrap: { alignSelf: "center", marginTop: 8 },
  camBadge: { position: "absolute", right: 2, bottom: 6, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.bg, alignItems: "center", justifyContent: "center" },
  photoHint: { textAlign: "center", fontSize: 12, color: colors.textMuted, marginTop: 10 },
  label: { fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 20, marginBottom: 8 },
  sugScroll: { marginHorizontal: -20, flexGrow: 0 },
  sug: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.primarySoft },
  sugText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  input: { height: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 14, fontSize: 15, color: colors.text },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pillOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: "700", color: colors.text },
  row: { flexDirection: "row", gap: 12 },
  toggle: { flex: 1, height: 46, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  toggleOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { fontSize: 14, fontWeight: "700", color: colors.text },
  save: { backgroundColor: colors.primary, borderRadius: 16, height: 54, alignItems: "center", justifyContent: "center", marginTop: 28 },
  saveText: { color: colors.onPrimary, fontSize: 16, fontWeight: "800" },
});