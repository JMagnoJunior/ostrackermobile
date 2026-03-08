import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { AuthSession } from "../../features/auth/session";

const SESSION_KEY = "auth_session";

function parseStoredSession(value: string): AuthSession | null {
  try {
    const parsed = JSON.parse(value) as Partial<AuthSession>;

    if (
      typeof parsed.token !== "string" ||
      typeof parsed.status !== "string" ||
      typeof parsed.pending !== "boolean"
    ) {
      return null;
    }

    const role =
      typeof parsed.role === "string" && parsed.role.trim()
        ? parsed.role.trim().toUpperCase()
        : undefined;

    return {
      token: parsed.token,
      status: parsed.status,
      pending: parsed.pending,
      role,
    };
  } catch {
    return null;
  }
}

function getWebStorage(): Storage | null {
  if (typeof globalThis.localStorage === "undefined") {
    return null;
  }

  return globalThis.localStorage;
}

function isWebPlatform(): boolean {
  return Platform.OS === "web";
}

export async function getStoredSession(): Promise<AuthSession | null> {
  if (isWebPlatform()) {
    const storage = getWebStorage();
    const rawValue = storage?.getItem(SESSION_KEY) ?? null;

    if (!rawValue) {
      return null;
    }

    return parseStoredSession(rawValue);
  }

  const rawValue = await SecureStore.getItemAsync(SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  return parseStoredSession(rawValue);
}

export async function setStoredSession(session: AuthSession): Promise<void> {
  const serializedSession = JSON.stringify(session);

  if (isWebPlatform()) {
    const storage = getWebStorage();
    storage?.setItem(SESSION_KEY, serializedSession);
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, serializedSession);
}

export async function clearStoredSession(): Promise<void> {
  if (isWebPlatform()) {
    const storage = getWebStorage();
    storage?.removeItem(SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_KEY);
}
