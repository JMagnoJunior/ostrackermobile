import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { SecretaryDashboardScreen } from "../dashboard/SecretaryDashboardScreen";
import { FinalizationScreen } from "../finalization/FinalizationScreen";
import { configureHttpAuth } from "../../shared/api/http";
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from "../../shared/auth/sessionStore";
import { LoginScreen } from "./LoginScreen";
import { PendingApprovalScreen } from "./PendingApprovalScreen";
import {
  AuthState,
  AuthSession,
  getAuthStateFromSession,
  isSecretaryLikeRole,
} from "./session";

const INVALID_SESSION_MESSAGE =
  "Sua sessao expirou ou e invalida. Entre novamente.";
const FORBIDDEN_MESSAGE = "Seu acesso nao esta liberado no momento.";

export function AuthGate() {
  const [authState, setAuthState] = useState<AuthState>({ kind: "bootstrapping" });
  const [notice, setNotice] = useState<string | null>(null);

  const authStateRef = useRef<AuthState>(authState);

  useEffect(() => {
    authStateRef.current = authState;
  }, [authState]);

  const bootstrap = useCallback(async () => {
    const storedSession = await getStoredSession();

    if (!storedSession) {
      setAuthState({ kind: "unauthenticated" });
      return;
    }

    setAuthState(getAuthStateFromSession(storedSession));
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const onAuthenticated = useCallback(async (session: AuthSession) => {
    await setStoredSession(session);
    setNotice(null);
    setAuthState(getAuthStateFromSession(session));
  }, []);

  const onSwitchAccount = useCallback(async () => {
    await clearStoredSession();
    setNotice(null);
    setAuthState({ kind: "unauthenticated" });
  }, []);

  const onUnauthorized = useCallback(async (status: number) => {
    await clearStoredSession();
    setAuthState({ kind: "unauthenticated" });
    setNotice(status === 401 ? INVALID_SESSION_MESSAGE : FORBIDDEN_MESSAGE);
  }, []);

  useEffect(() => {
    configureHttpAuth({
      getAccessToken: async () => {
        const currentState = authStateRef.current;

        if (currentState.kind === "active" || currentState.kind === "pending") {
          return currentState.session.token;
        }

        return null;
      },
      onUnauthorized,
    });

    return () => {
      configureHttpAuth({});
    };
  }, [onUnauthorized]);

  if (authState.kind === "bootstrapping") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#0f766e" size="large" />
        <Text style={styles.loadingText}>Carregando sessao...</Text>
      </View>
    );
  }

  if (authState.kind === "unauthenticated") {
    return (
      <LoginScreen
        notice={notice}
        onAuthenticated={onAuthenticated}
        onNoticeConsumed={() => setNotice(null)}
      />
    );
  }

  if (authState.kind === "pending") {
    return <PendingApprovalScreen onSwitchAccount={onSwitchAccount} />;
  }

  if (isSecretaryLikeRole(authState.session.role)) {
    return <SecretaryDashboardScreen />;
  }

  return <FinalizationScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    color: "#334155",
    fontSize: 14,
    marginTop: 10,
  },
});
