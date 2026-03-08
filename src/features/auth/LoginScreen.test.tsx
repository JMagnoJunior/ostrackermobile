import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { AxiosError } from "axios";
import * as Google from "expo-auth-session/providers/google";
import React from "react";

import { loginWithGoogle } from "./api";
import { LoginScreen } from "./LoginScreen";

jest.mock("./api", () => {
  const actual = jest.requireActual("./api");
  return {
    ...actual,
    loginWithGoogle: jest.fn(),
  };
});

jest.mock("expo-auth-session/providers/google", () => ({
  useIdTokenAuthRequest: jest.fn(),
}));

const promptAsyncMock = jest.fn();

function buildAxiosError(status?: number): AxiosError {
  return new AxiosError(
    "request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    status
      ? ({
          status,
          statusText: "error",
          headers: {},
          config: { headers: {} },
          data: {},
        } as any)
      : undefined,
  );
}

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = "web-client";
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID = "android-client";
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = "ios-client";

    (Google.useIdTokenAuthRequest as jest.Mock).mockReturnValue([
      {},
      null,
      promptAsyncMock,
    ]);
  });

  afterAll(() => {
    delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    delete process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
    delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  });

  it("shows loading while OAuth is in progress", async () => {
    let resolvePrompt: ((value: any) => void) | null = null;

    const promptPromise = new Promise((resolve) => {
      resolvePrompt = resolve;
    });

    promptAsyncMock.mockReturnValueOnce(promptPromise);

    const screen = render(<LoginScreen onAuthenticated={jest.fn()} />);

    await act(async () => {
      fireEvent.press(screen.getByTestId("login-google-button"));
    });

    await waitFor(() => {
      expect(screen.getByText("Conectando ao Google...")).toBeTruthy();
    });

    await act(async () => {
      resolvePrompt?.({ type: "dismiss" });
      await promptPromise;
    });

    await waitFor(() => {
      expect(screen.getByText("Entrar com Google")).toBeTruthy();
    });
  });

  it("prevents double-tap login requests", async () => {
    promptAsyncMock.mockResolvedValue({ type: "dismiss" });

    const screen = render(<LoginScreen onAuthenticated={jest.fn()} />);
    const button = screen.getByTestId("login-google-button");

    await act(async () => {
      fireEvent.press(button);
      fireEvent.press(button);
    });

    expect(promptAsyncMock).toHaveBeenCalledTimes(1);
  });

  it("shows friendly error when backend returns 401", async () => {
    promptAsyncMock.mockResolvedValue({
      type: "success",
      authentication: {
        idToken: "google-token",
      },
      params: {},
    });

    (loginWithGoogle as jest.Mock).mockRejectedValueOnce(buildAxiosError(401));

    const screen = render(<LoginScreen onAuthenticated={jest.fn()} />);

    fireEvent.press(screen.getByTestId("login-google-button"));

    await waitFor(() => {
      expect(
        screen.getByText("Nao foi possivel validar sua conta Google. Tente novamente."),
      ).toBeTruthy();
    });
  });
});
