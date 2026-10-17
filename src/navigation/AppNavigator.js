import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import SplashScreen from "../screens/SplashScreen";
import MainScreen from "../screens/MainScreen";
import DealDetailsScreen from "../screens/DealDetailsScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import PickupScreen from "../screens/PickupScreen";
import StoreOnboardingScreen from "../screens/StoreOnboardingScreen";
import StoreDashboardScreen from "../screens/StoreDashboardScreen";
import PostDealScreen from "../screens/PostDealScreen";
import StoreMenuScreen from "../screens/StoreMenuScreen";
import MenuItemFormScreen from "../screens/MenuItemFormScreen";
import VerifyPickupScreen from "../screens/VerifyPickupScreen";

import { useAuth } from "../store/AuthContext";
import colors from "../theme/colors";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isSignedIn, loading } = useAuth();

  // While the saved session is being read from the phone
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {!isSignedIn ? (
          /* ---------- Logged out: only the login screen ---------- */
          <Stack.Screen name="Login" component={LoginScreen} options={{ animation: "fade" }} />
        ) : (
          /* ---------- Logged in: the whole app ---------- */
          <>
            <Stack.Screen name="Main" component={MainScreen} options={{ animation: "fade" }} />

            {/* Customer screens */}
            <Stack.Screen name="DealDetails" component={DealDetailsScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Pickup" component={PickupScreen} />

            {/* Store screens */}
            <Stack.Screen name="StoreOnboarding" component={StoreOnboardingScreen} />
            <Stack.Screen name="StoreDashboard" component={StoreDashboardScreen} />
            <Stack.Screen name="PostDeal" component={PostDealScreen} />
            <Stack.Screen name="StoreMenu" component={StoreMenuScreen} />
            <Stack.Screen name="MenuItemForm" component={MenuItemFormScreen} />
            <Stack.Screen name="VerifyPickup" component={VerifyPickupScreen} />

            {/* Splash kept for later use */}
            <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: "fade" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}