import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Text, TextInput } from "../components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import { useDeals } from "../store/DealsContext";

export default function VerifyPickupScreen({ navigation }) {
  const { verifyPickup } = useDeals();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (code.trim().length < 6) {
      setError("Enter the 6-digit code from the customer.");
      return;
    }
    if (verifyPickup(code)) {
      Alert.alert("Order handed over", "The order is marked as collected.", [{ text: "Done", onPress: () => navigation.goBack() }]);
    } else {
      setError("This code doesn't match any pending order for your store.");
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={s.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={s.title}>Verify pickup</Text>
      </View>

      <View style={s.content}>
        <Text style={s.label}>Customer's pickup code</Text>
        <TextInput
          value={code}
          onChangeText={(t) => {
            setCode(t.replace(/\D/g, "").slice(0, 6));
            setError("");
          }}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="••••••"
          placeholderTextColor={colors.border}
          style={s.codeInput}
          autoFocus
        />
        {!!error && <Text style={s.error}>{error}</Text>}

        <Pressable style={[s.submit, code.length < 6 && { opacity: 0.5 }]} onPress={submit}>
          <Text style={s.submitText}>Verify and hand over</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800", color: colors.text },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  label: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 10 },
  codeInput: { height: 70, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, textAlign: "center", fontSize: 32, fontWeight: "800", letterSpacing: 10, color: colors.text },
  error: { color: colors.danger, fontSize: 13, marginTop: 10 },
  submit: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  submitText: { color: colors.onPrimary, fontSize: 15, fontWeight: "800" },
});