// src/components/AppText.js
// Drop-in replacements for Text and TextInput that use the Inter font.
// The fontWeight you already write in styles is mapped to the matching Inter file.
import React from "react";
import { StyleSheet, Text as RNText, TextInput as RNTextInput } from "react-native";

const FAMILY = {
  normal: "Inter_400Regular",
  "100": "Inter_400Regular",
  "200": "Inter_400Regular",
  "300": "Inter_400Regular",
  "400": "Inter_400Regular",
  "500": "Inter_500Medium",
  "600": "Inter_600SemiBold",
  "700": "Inter_700Bold",
  bold: "Inter_700Bold",
  // heavier weights are capped at 700 for a lighter, Zomato-like look
  "800": "Inter_700Bold",
  "900": "Inter_700Bold",
};

function withFont(style) {
  const flat = StyleSheet.flatten(style) || {};
  const family = FAMILY[String(flat.fontWeight ?? "400")] || "Inter_400Regular";
  return [flat, { fontFamily: family, fontWeight: "normal" }];
}

// "@type {any}" tells VS Code these accept any props (children, style, onPress...),
// so it stops drawing red lines under every <Text>. It does not change how the app runs.

/** @type {any} */
export const Text = React.forwardRef(function Text({ style, ...props }, ref) {
  return <RNText ref={ref} {...props} style={withFont(style)} />;
});

/** @type {any} */
export const TextInput = React.forwardRef(function TextInput({ style, ...props }, ref) {
  return <RNTextInput ref={ref} {...props} style={withFont(style)} />;
});

export default Text;