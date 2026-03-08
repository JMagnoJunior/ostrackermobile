import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function AccessControlScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Em breve: Controle de Acesso</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  text: {
    color: "#334155",
    fontSize: 16,
  },
});
