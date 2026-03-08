import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";

import { AuthGate } from "./src/features/auth/AuthGate";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <AuthGate />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
});
