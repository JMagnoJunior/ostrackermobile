import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import { PendingApprovalScreen } from "./PendingApprovalScreen";

describe("PendingApprovalScreen", () => {
  it("renders pending approval message", () => {
    const screen = render(<PendingApprovalScreen onSwitchAccount={jest.fn()} />);

    expect(screen.getByText("Aguardando aprovacao")).toBeTruthy();
    expect(
      screen.getByText(
        "Seu cadastro foi recebido e esta pendente de aprovacao por um superusuario.",
      ),
    ).toBeTruthy();
  });

  it("calls switch account action", async () => {
    let resolveSwitch: () => void = () => undefined;

    const onSwitchAccount = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSwitch = resolve;
        }),
    );

    const screen = render(<PendingApprovalScreen onSwitchAccount={onSwitchAccount} />);

    fireEvent.press(screen.getByTestId("switch-account-button"));

    expect(onSwitchAccount).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Saindo...")).toBeTruthy();

    resolveSwitch();

    await waitFor(() => {
      expect(screen.getByText("Trocar conta")).toBeTruthy();
    });
  });
});
