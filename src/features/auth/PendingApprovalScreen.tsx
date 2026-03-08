import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

type PendingApprovalScreenProps = {
  onSwitchAccount: () => Promise<void> | void;
};

export function PendingApprovalScreen({ onSwitchAccount }: PendingApprovalScreenProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function switchAccount() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await onSwitchAccount();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aguardando aprovacao</Text>
      <Text style={styles.description}>
        Seu cadastro foi recebido e esta pendente de aprovacao por um superusuario.
      </Text>

      <Pressable
        accessibilityRole="button"
        disabled={isSigningOut}
        onPress={switchAccount}
        style={[styles.switchButton, isSigningOut ? styles.switchButtonDisabled : null]}
        testID="switch-account-button"
      >
        {isSigningOut ? <ActivityIndicator color="#ffffff" /> : null}
        <Text style={styles.switchButtonText}>
          {isSigningOut ? "Saindo..." : "Trocar conta"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#0f172a",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  switchButton: {
    alignItems: "center",
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  switchButtonDisabled: {
    backgroundColor: "#64748b",
  },
  switchButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
