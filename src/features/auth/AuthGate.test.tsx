import { render, waitFor } from "@testing-library/react-native";
import React from "react";

import { getStoredSession } from "../../shared/auth/sessionStore";
import { AuthGate } from "./AuthGate";

jest.mock("../../shared/auth/sessionStore", () => ({
  clearStoredSession: jest.fn(),
  getStoredSession: jest.fn(),
  setStoredSession: jest.fn(),
}));

jest.mock("./LoginScreen", () => ({
  LoginScreen: () => {
    const ReactLib = require("react");
    const { Text } = require("react-native");
    return ReactLib.createElement(Text, null, "LOGIN_SCREEN");
  },
}));

jest.mock("./PendingApprovalScreen", () => ({
  PendingApprovalScreen: () => {
    const ReactLib = require("react");
    const { Text } = require("react-native");
    return ReactLib.createElement(Text, null, "PENDING_SCREEN");
  },
}));

jest.mock("../finalization/FinalizationScreen", () => ({
  FinalizationScreen: () => {
    const ReactLib = require("react");
    const { Text } = require("react-native");
    return ReactLib.createElement(Text, null, "FINALIZATION_SCREEN");
  },
}));

jest.mock("../dashboard/SecretaryDashboardScreen", () => ({
  SecretaryDashboardScreen: () => {
    const ReactLib = require("react");
    const { Text } = require("react-native");
    return ReactLib.createElement(Text, null, "SECRETARY_DASHBOARD_SCREEN");
  },
}));

jest.mock("../superusuario/SuperusuarioHomeScreen", () => ({
  SuperusuarioHomeScreen: () => {
    const ReactLib = require("react");
    const { Text } = require("react-native");
    return ReactLib.createElement(Text, null, "SUPERUSUARIO_HOME_SCREEN");
  },
}));

const mockedGetStoredSession = getStoredSession as jest.MockedFunction<
  typeof getStoredSession
>;

describe("AuthGate", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("shows login screen when there is no session", async () => {
    mockedGetStoredSession.mockResolvedValueOnce(null);

    const screen = render(<AuthGate />);

    await waitFor(() => {
      expect(screen.getByText("LOGIN_SCREEN")).toBeTruthy();
    });
  });

  it("shows pending screen when session is pending", async () => {
    mockedGetStoredSession.mockResolvedValueOnce({
      token: "jwt",
      status: "PENDENTE_APROVACAO",
      pending: true,
    });

    const screen = render(<AuthGate />);

    await waitFor(() => {
      expect(screen.getByText("PENDING_SCREEN")).toBeTruthy();
    });
  });

  it("shows finalization screen when session is active", async () => {
    mockedGetStoredSession.mockResolvedValueOnce({
      token: "jwt",
      status: "ATIVO",
      pending: false,
    });

    const screen = render(<AuthGate />);

    await waitFor(() => {
      expect(screen.getByText("FINALIZATION_SCREEN")).toBeTruthy();
    });
  });

  it("shows secretary dashboard when session role is secretaria", async () => {
    mockedGetStoredSession.mockResolvedValueOnce({
      token: "jwt",
      status: "ATIVO",
      pending: false,
      role: "SECRETARIA",
    });

    const screen = render(<AuthGate />);

    await waitFor(() => {
      expect(screen.getByText("SECRETARY_DASHBOARD_SCREEN")).toBeTruthy();
    });
  });

  it("shows superusuario home screen when session role is superusuario", async () => {
    mockedGetStoredSession.mockResolvedValueOnce({
      token: "jwt",
      status: "ATIVO",
      pending: false,
      role: "SUPERUSUARIO",
    });

    const screen = render(<AuthGate />);

    await waitFor(() => {
      expect(screen.getByText("SUPERUSUARIO_HOME_SCREEN")).toBeTruthy();
    });
  });

  it("shows finalization screen when session role is tecnico", async () => {
    mockedGetStoredSession.mockResolvedValueOnce({
      token: "jwt",
      status: "ATIVO",
      pending: false,
      role: "TECNICO",
    });

    const screen = render(<AuthGate />);

    await waitFor(() => {
      expect(screen.getByText("FINALIZATION_SCREEN")).toBeTruthy();
    });
  });
});
