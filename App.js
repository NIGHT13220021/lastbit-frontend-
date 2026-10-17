import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";

import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/store/AuthContext";
import { DealsProvider } from "./src/store/DealsContext";

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DealsProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </DealsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}