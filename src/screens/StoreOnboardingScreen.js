import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput } from "../components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import { useDeals } from "../store/DealsContext";
import { toMinutes, normalizeClock } from "../utils/time";

const TYPES = ["Restaurant", "Dhaba", "Cafe", "Sweet shop"];

function Field({ label, hint, children }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.label}>{label}</Text>
      {children}
      {!!hint && <Text style={s.hint}>{hint}</Text>}
    </View>
  );
}

export default function StoreOnboardingScreen({ navigation }) {
  const { store, registerStore, approveStore } = useDeals();

  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [fssai, setFssai] = useState("");
  const [type, setType] = useState("Restaurant");
  const [closing, setClosing] = useState("");

  // once verified, go straight to the dashboard
  useEffect(() => {
    if (store?.status === "verified") navigation.replace("StoreDashboard");
  }, [store, navigation]);

  const submit = () => {
    if (!name.trim()) return Alert.alert("Enter your store name");
    if (!owner.trim()) return Alert.alert("Enter the owner's name");
    if (phone.length !== 10) return Alert.alert("Enter a valid 10-digit phone number");
    if (!address.trim()) return Alert.alert("Enter your store address");
    if (fssai.length !== 14) return Alert.alert("FSSAI licence number must be 14 digits");
    if (toMinutes(closing) === null) return Alert.alert("Enter closing time like 10:30 PM");
    registerStore({ name: name.trim(), owner: owner.trim(), phone, address: address.trim(), fssai, type, closing: normalizeClock(closing) });
  };

  const header = (
    <View style={s.header}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={s.back}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>
      <Text style={s.title}>{store ? "Store verification" : "Register your store"}</Text>
    </View>
  );

  /* ---------- waiting for verification ---------- */
  if (store?.status === "pending") {
    return (
      <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
        {header}
        <View style={s.pending}>
          <View style={s.pendingIcon}>
            <Ionicons name="time-outline" size={40} color={colors.primary} />
          </View>
          <Text style={s.pendingTitle}>Verification in progress</Text>
          <Text style={s.pendingText}>
            We're checking the FSSAI licence for {store.name}. You can post deals as soon as it's approved.
          </Text>

          <View style={s.summary}>
            <Text style={s.summaryRow}>Type: {store.type}</Text>
            <Text style={s.summaryRow}>Closes at: {store.closing}</Text>
            <Text style={s.summaryRow}>Owner: {store.owner}</Text>
            <Text style={s.summaryRow}>Phone: +91 {store.phone}</Text>
            <Text style={s.summaryRow}>FSSAI: {store.fssai}</Text>
          </View>

          {/* DEMO ONLY - remove when real admin approval exists */}
          <Pressable style={s.demoBtn} onPress={approveStore}>
            <Text style={s.demoText}>Approve now (demo only)</Text>
          </Pressable>
          <Text style={s.demoNote}>In the real app, our team approves stores after checking the licence.</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ---------- registration form ---------- */
  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      {header}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label="Store name">
            <TextInput value={name} onChangeText={setName} placeholder="e.g. Sharma Bakery" placeholderTextColor={colors.textMuted} style={s.input} />
          </Field>
          <Field label="Owner name">
            <TextInput value={owner} onChangeText={setOwner} placeholder="Full name" placeholderTextColor={colors.textMuted} style={s.input} />
          </Field>
          <Field label="Phone number">
            <TextInput
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
              keyboardType="number-pad"
              placeholder="10-digit mobile number"
              placeholderTextColor={colors.textMuted}
              style={s.input}
            />
          </Field>
          <Field label="Store address">
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Shop no., sector, city"
              placeholderTextColor={colors.textMuted}
              style={[s.input, { height: 76, paddingTop: 12, textAlignVertical: "top" }]}
              multiline
            />
          </Field>
          <Field label="Store type">
            <View style={s.typeRow}>
              {TYPES.map((t) => (
                <Pressable key={t} style={[s.typePill, type === t && s.typePillOn]} onPress={() => setType(t)}>
                  <Text style={[s.typeText, type === t && { color: colors.onPrimary }]}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </Field>
          <Field label="Closing time" hint="Deals can only run until this time.">
            <TextInput value={closing} onChangeText={setClosing} placeholder="10:30 PM" autoCapitalize="characters" placeholderTextColor={colors.textMuted} style={s.input} />
          </Field>
          <Field label="FSSAI licence number" hint="Required to sell food. 14 digits.">
            <TextInput
              value={fssai}
              onChangeText={(t) => setFssai(t.replace(/\D/g, "").slice(0, 14))}
              keyboardType="number-pad"
              placeholder="14-digit licence number"
              placeholderTextColor={colors.textMuted}
              style={s.input}
            />
          </Field>

          <Pressable style={s.submit} onPress={submit}>
            <Text style={s.submitText}>Submit for verification</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  content: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 6 },
  label: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 8 },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 14, fontSize: 15, color: colors.text },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typePill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  typePillOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { fontSize: 13, fontWeight: "700", color: colors.text },
  submit: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  submitText: { color: colors.onPrimary, fontSize: 15, fontWeight: "800" },

  pending: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 30 },
  pendingIcon: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  pendingTitle: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 18 },
  pendingText: { fontSize: 14, color: colors.textMuted, textAlign: "center", marginTop: 8, lineHeight: 20 },
  summary: { alignSelf: "stretch", backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, marginTop: 24, gap: 6 },
  summaryRow: { fontSize: 14, color: colors.text },
  demoBtn: { alignSelf: "stretch", borderWidth: 1.5, borderColor: colors.accent, borderStyle: "dashed", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 28 },
  demoText: { color: colors.accentText, fontWeight: "800", fontSize: 14 },
  demoNote: { fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 8 },
});