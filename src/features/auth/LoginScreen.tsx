import { AuthSessionResult } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getLoginErrorMessage, loginWithGoogle } from "./api";
import { AuthSession } from "./session";

WebBrowser.maybeCompleteAuthSession();

type LoginPhase = "idle" | "oauth_loading" | "backend_loading";

type LoginScreenProps = {
  onAuthenticated: (session: AuthSession) => Promise<void> | void;
  notice?: string | null;
  onNoticeConsumed?: () => void;
};

const runtimeProcess = globalThis as {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

function getEnv(name: string): string | undefined {
  const value = runtimeProcess.process?.env?.[name]?.trim();
  if (!value) {
    return undefined;
  }

  return value;
}

function resolveIdToken(result: AuthSessionResult): string | null {
  if (result.type !== "success") {
    return null;
  }

  const fromAuthentication = result.authentication?.idToken;
  if (typeof fromAuthentication === "string" && fromAuthentication.length > 0) {
    return fromAuthentication;
  }

  const fromParams = result.params?.id_token;
  if (typeof fromParams === "string" && fromParams.length > 0) {
    return fromParams;
  }

  return null;
}

export function LoginScreen({
  onAuthenticated,
  notice,
  onNoticeConsumed,
}: LoginScreenProps) {
  const [phase, setPhase] = useState<LoginPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const loginLockRef = useRef(false);

  const webClientId = getEnv("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID");
  const androidClientId = getEnv("EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID");
  const iosClientId = getEnv("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID");

  const hasCurrentPlatformClientId = useMemo(
    () =>
      Platform.select({
        android: Boolean(androidClientId),
        ios: Boolean(iosClientId),
        default: Boolean(webClientId),
      }) ?? false,
    [androidClientId, iosClientId, webClientId],
  );

  const [request, _response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: webClientId ?? "missing-web-client-id",
    androidClientId: androidClientId ?? webClientId ?? "missing-android-client-id",
    iosClientId: iosClientId ?? webClientId ?? "missing-ios-client-id",
    scopes: ["openid", "profile", "email"],
    selectAccount: true,
  });

  const isLoading = phase !== "idle";
  const isButtonDisabled =
    isLoading || loginLockRef.current || !request || !hasCurrentPlatformClientId;

  async function onGoogleSignInPress() {
    if (
      phase !== "idle" ||
      loginLockRef.current ||
      !request ||
      !hasCurrentPlatformClientId
    ) {
      return;
    }

    loginLockRef.current = true;
    onNoticeConsumed?.();
    setError(null);
    setPhase("oauth_loading");

    try {
      const oauthResult = await promptAsync();

      if (oauthResult.type !== "success") {
        setPhase("idle");
        return;
      }

      const idToken = resolveIdToken(oauthResult);
      if (!idToken) {
        setError("Nao foi possivel validar sua conta Google. Tente novamente.");
        setPhase("idle");
        return;
      }

      setPhase("backend_loading");
      const session = await loginWithGoogle(idToken);
      await onAuthenticated(session);
      setPhase("idle");
    } catch (requestError) {
      setError(getLoginErrorMessage(requestError));
      setPhase("idle");
    } finally {
      loginLockRef.current = false;
    }
  }

  const buttonText =
    phase === "oauth_loading"
      ? "Conectando ao Google..."
      : phase === "backend_loading"
        ? "Validando acesso..."
        : "Entrar com Google";

  const missingClientEnvName = Platform.select({
    android: "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID",
    ios: "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
    default: "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
  });

  const setupMessage = hasCurrentPlatformClientId
    ? null
    : `Configure ${missingClientEnvName} para continuar.`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OS Tracker</Text>
      <Text style={styles.subtitle}>Entre com Google para continuar.</Text>

      {setupMessage ? <Text style={styles.warningBanner}>{setupMessage}</Text> : null}
      {notice ? <Text style={styles.infoBanner}>{notice}</Text> : null}
      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={isButtonDisabled}
        onPress={onGoogleSignInPress}
        style={[styles.loginButton, isButtonDisabled ? styles.loginButtonDisabled : null]}
        testID="login-google-button"
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : null}
        <Text style={styles.loginButtonText}>{buttonText}</Text>
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
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#334155",
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
  },
  infoBanner: {
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    color: "#1e40af",
    marginBottom: 12,
    padding: 10,
    textAlign: "center",
  },
  warningBanner: {
    backgroundColor: "#fef9c3",
    borderRadius: 8,
    color: "#854d0e",
    marginBottom: 12,
    padding: 10,
    textAlign: "center",
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    color: "#991b1b",
    marginBottom: 12,
    padding: 10,
    textAlign: "center",
  },
  loginButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  loginButtonDisabled: {
    backgroundColor: "#64748b",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
