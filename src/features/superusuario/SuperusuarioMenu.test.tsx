import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { SuperusuarioMenu } from "./SuperusuarioMenu";

describe("SuperusuarioMenu", () => {
  const onNavigate = jest.fn();
  const onLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all four menu items", () => {
    const screen = render(
      <SuperusuarioMenu
        activeModule="TECNICO"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />,
    );

    expect(screen.getByText("Módulo Técnico")).toBeTruthy();
    expect(screen.getByText("Módulo Secretaria")).toBeTruthy();
    expect(screen.getByText("Controle de Acesso")).toBeTruthy();
    expect(screen.getByText("Monitoramento")).toBeTruthy();
  });

  it("marks the active module item as selected", () => {
    const screen = render(
      <SuperusuarioMenu
        activeModule="SECRETARIA"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />,
    );

    // The selected button is "Módulo Secretaria"; getByRole with selected: true returns it
    const selectedButton = screen.getByRole("button", { selected: true });
    expect(selectedButton.props.accessibilityState?.selected).toBe(true);

    // Non-selected buttons should not have selected: true
    const nonSelectedButtons = screen.getAllByRole("button", {
      selected: false,
    });
    expect(nonSelectedButtons.length).toBeGreaterThan(0);
  });

  it("calls onNavigate with the correct module when a menu item is tapped", () => {
    const screen = render(
      <SuperusuarioMenu
        activeModule="TECNICO"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.press(screen.getByText("Controle de Acesso"));
    expect(onNavigate).toHaveBeenCalledWith("ACESSO");

    fireEvent.press(screen.getByText("Monitoramento"));
    expect(onNavigate).toHaveBeenCalledWith("MONITORAMENTO");
  });

  it("calls onLogout when the logout button is tapped", () => {
    const screen = render(
      <SuperusuarioMenu
        activeModule="TECNICO"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.press(screen.getByText("Sair"));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("renders exactly four menu items and no extras", () => {
    const screen = render(
      <SuperusuarioMenu
        activeModule="TECNICO"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />,
    );

    const buttons = screen.getAllByRole("button");
    // 4 menu items + 1 logout button
    expect(buttons).toHaveLength(5);
  });
});
