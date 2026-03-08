import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from "./sessionStore";

jest.mock("expo-secure-store", () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

function setPlatformOSForTest(os: "ios" | "android" | "web"): () => void {
  const descriptor = Object.getOwnPropertyDescriptor(Platform, "OS");

  Object.defineProperty(Platform, "OS", {
    configurable: true,
    value: os,
  });

  return () => {
    if (descriptor) {
      Object.defineProperty(Platform, "OS", descriptor);
      return;
    }

    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "ios",
    });
  };
}

describe("sessionStore", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("stores session payload", async () => {
    await setStoredSession({
      token: "jwt-token",
      status: "ATIVO",
      pending: false,
    });

    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
      "auth_session",
      JSON.stringify({
        token: "jwt-token",
        status: "ATIVO",
        pending: false,
      }),
    );
  });

  it("retrieves persisted session", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValueOnce(
      JSON.stringify({
        token: "jwt-token",
        status: "ATIVO",
        pending: false,
      }),
    );

    await expect(getStoredSession()).resolves.toEqual({
      token: "jwt-token",
      status: "ATIVO",
      pending: false,
    });
  });

  it("returns null for malformed payload", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValueOnce("not-json");

    await expect(getStoredSession()).resolves.toBeNull();
  });

  it("clears stored session", async () => {
    await clearStoredSession();

    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith("auth_session");
  });

  it("uses localStorage fallback on web", async () => {
    const restorePlatform = setPlatformOSForTest("web");
    const storageData: Record<string, string> = {};
    const originalLocalStorage = globalThis.localStorage;

    const localStorageMock = {
      clear: jest.fn(() => {
        Object.keys(storageData).forEach((key) => {
          delete storageData[key];
        });
      }),
      getItem: jest.fn((key: string) => storageData[key] ?? null),
      key: jest.fn((index: number) => Object.keys(storageData)[index] ?? null),
      get length() {
        return Object.keys(storageData).length;
      },
      removeItem: jest.fn((key: string) => {
        delete storageData[key];
      }),
      setItem: jest.fn((key: string, value: string) => {
        storageData[key] = value;
      }),
    };

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: localStorageMock,
    });

    try {
      await setStoredSession({
        token: "jwt-token",
        status: "ATIVO",
        pending: false,
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "auth_session",
        JSON.stringify({
          token: "jwt-token",
          status: "ATIVO",
          pending: false,
        }),
      );
      expect(mockedSecureStore.setItemAsync).not.toHaveBeenCalled();

      await expect(getStoredSession()).resolves.toEqual({
        token: "jwt-token",
        status: "ATIVO",
        pending: false,
      });
      expect(localStorageMock.getItem).toHaveBeenCalledWith("auth_session");
      expect(mockedSecureStore.getItemAsync).not.toHaveBeenCalled();

      await clearStoredSession();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_session");
      expect(mockedSecureStore.deleteItemAsync).not.toHaveBeenCalled();
    } finally {
      if (typeof originalLocalStorage === "undefined") {
        delete (globalThis as { localStorage?: Storage }).localStorage;
      } else {
        Object.defineProperty(globalThis, "localStorage", {
          configurable: true,
          value: originalLocalStorage,
        });
      }
      restorePlatform();
    }
  });
});
