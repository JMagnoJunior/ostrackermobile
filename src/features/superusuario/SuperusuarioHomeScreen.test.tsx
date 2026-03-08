import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { SuperusuarioHomeScreen } from "./SuperusuarioHomeScreen";

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

jest.mock("../accessControl/AccessControlScreen", () => ({
  AccessControlScreen: () => {
    const ReactLib = require("react");
    const { Text } = require("react-native");
    return ReactLib.createElement(Text, null, "ACCESS_CONTROL_SCREEN");
  },
}));

describe("SuperusuarioHomeScreen", () => {
  const onSwitchAccount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders FinalizationScreen as the default module (TECNICO)", () => {
    const screen = render(
      <SuperusuarioHomeScreen onSwitchAccount={onSwitchAccount} />,
    );

    expect(screen.getByText("FINALIZATION_SCREEN")).toBeTruthy();
  });

  it("renders SecretaryDashboardScreen after selecting Módulo Secretaria", () => {
    const screen = render(
      <SuperusuarioHomeScreen onSwitchAccount={onSwitchAccount} />,
    );

    fireEvent.press(screen.getByText("Módulo Secretaria"));
    expect(screen.getByText("SECRETARY_DASHBOARD_SCREEN")).toBeTruthy();
  });

  it("renders AccessControlScreen after selecting Controle de Acesso", () => {
    const screen = render(
      <SuperusuarioHomeScreen onSwitchAccount={onSwitchAccount} />,
    );

    fireEvent.press(screen.getByText("Controle de Acesso"));
    expect(screen.getByText("ACCESS_CONTROL_SCREEN")).toBeTruthy();
  });

  it("renders SecretaryDashboardScreen after selecting Monitoramento", () => {
    const screen = render(
      <SuperusuarioHomeScreen onSwitchAccount={onSwitchAccount} />,
    );

    fireEvent.press(screen.getByText("Monitoramento"));
    expect(screen.getByText("SECRETARY_DASHBOARD_SCREEN")).toBeTruthy();
  });

  it("calls onSwitchAccount when logout is pressed", () => {
    const screen = render(
      <SuperusuarioHomeScreen onSwitchAccount={onSwitchAccount} />,
    );

    fireEvent.press(screen.getByText("Sair"));
    expect(onSwitchAccount).toHaveBeenCalledTimes(1);
  });
});
