import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

type ListStateMode = "loading" | "empty" | "error";

type ListStateViewProps = {
  mode: ListStateMode;
  message: string;
  onRetry?: () => void;
};

export function ListStateView({ mode, message, onRetry }: ListStateViewProps) {
  return (
    <View style={styles.container} testID={`list-state-${mode}`}>
      {mode === "loading" ? <ActivityIndicator color="#0f766e" size="small" /> : null}
      <Text style={styles.message}>{message}</Text>
      {mode !== "loading" && onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 8,
    padding: 18,
  },
  message: {
    color: "#334155",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0f766e",
    borderRadius: 8,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
});
