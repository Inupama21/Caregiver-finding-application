import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ExpoRoot } from "expo-router";
import Toast from "react-native-toast-message";
import { ErrorBoundary } from "./components/ErrorBoundary";
import StripeProvider from "./app/providers/StripeProvider";

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StripeProvider>
            <ExpoRoot context={require.context("./app")} />
            <StatusBar style="auto" />
            <Toast />
          </StripeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
