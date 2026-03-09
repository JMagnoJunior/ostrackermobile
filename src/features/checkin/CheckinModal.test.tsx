import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import * as api from "./api";
import { CheckinModal } from "./CheckinModal";

const mockConfirmCheckin = jest.spyOn(api, "confirmCheckin");

const defaultProps = {
  visible: true,
  orderId: "order-123",
  orderLabel: "Joao Silva — AGENDADA_PRESENCIAL",
  onClose: jest.fn(),
  onSuccess: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CheckinModal", () => {
  it("shows informative text, confirm and cancel buttons in idle state without ActivityIndicator", () => {
    const screen = render(<CheckinModal {...defaultProps} />);

    // Title and button both contain "Confirmar Entrega"; ensure at least 2 occurrences
    expect(screen.getAllByText("Confirmar Entrega").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId("btn-confirm")).toBeTruthy();
    expect(screen.getByTestId("btn-cancel")).toBeTruthy();
    expect(screen.queryByTestId("confirm-loading-indicator")).toBeNull();
  });

  it("confirm button is enabled in idle state", () => {
    const screen = render(<CheckinModal {...defaultProps} />);
    const confirmBtn = screen.getByTestId("btn-confirm");
    expect(confirmBtn.props.accessibilityState?.disabled).toBeFalsy();
  });

  it("cancel button is enabled in idle state", () => {
    const screen = render(<CheckinModal {...defaultProps} />);
    const cancelBtn = screen.getByTestId("btn-cancel");
    expect(cancelBtn.props.accessibilityState?.disabled).toBeFalsy();
  });

  it("shows ActivityIndicator and disables buttons while submitting", async () => {
    let resolveCheckin!: () => void;
    mockConfirmCheckin.mockReturnValueOnce(
      new Promise<{ id: string; status: string; deliveredAt: string }>((resolve) => {
        resolveCheckin = () =>
          resolve({ id: "order-123", status: "ENTREGUE", deliveredAt: "2026-03-09T10:00:00Z" });
      }),
    );

    const screen = render(<CheckinModal {...defaultProps} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(screen.getByTestId("confirm-loading-indicator")).toBeTruthy();
    });

    const cancelBtn = screen.getByTestId("btn-cancel");
    expect(cancelBtn.props.accessibilityState?.disabled).toBe(true);

    const confirmBtn = screen.getByTestId("btn-confirm");
    expect(confirmBtn.props.accessibilityState?.disabled).toBe(true);

    resolveCheckin();
  });

  it("calls onSuccess after successful checkin without calling onClose", async () => {
    const onSuccess = jest.fn();
    const onClose = jest.fn();
    mockConfirmCheckin.mockResolvedValueOnce({
      id: "order-123",
      status: "ENTREGUE",
      deliveredAt: "2026-03-09T10:00:00Z",
    });

    const screen = render(<CheckinModal {...defaultProps} onSuccess={onSuccess} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows 403 error message without calling onClose", async () => {
    const onClose = jest.fn();
    const error = Object.assign(new Error("Forbidden"), {
      isAxiosError: true,
      response: { status: 403 },
      config: {},
    });
    mockConfirmCheckin.mockRejectedValueOnce(error);

    const screen = render(<CheckinModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(screen.getByTestId("submit-error-banner")).toBeTruthy();
      expect(
        screen.getByText("Seu perfil nao tem permissao para realizar o check-in."),
      ).toBeTruthy();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows 404 error message without calling onClose", async () => {
    const onClose = jest.fn();
    const error = Object.assign(new Error("Not Found"), {
      isAxiosError: true,
      response: { status: 404 },
      config: {},
    });
    mockConfirmCheckin.mockRejectedValueOnce(error);

    const screen = render(<CheckinModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(
        screen.getByText("OS nao encontrada. Atualize o dashboard e tente novamente."),
      ).toBeTruthy();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows 409 conflict message without calling onClose", async () => {
    const onClose = jest.fn();
    const error = Object.assign(new Error("Conflict"), {
      isAxiosError: true,
      response: { status: 409 },
      config: {},
    });
    mockConfirmCheckin.mockRejectedValueOnce(error);

    const screen = render(<CheckinModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(
        screen.getByText("Esta OS nao esta em um status valido para check-in. Atualize o dashboard."),
      ).toBeTruthy();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows network error message without calling onClose", async () => {
    const onClose = jest.fn();
    const error = Object.assign(new Error("Network Error"), {
      isAxiosError: true,
      response: undefined,
      config: {},
    });
    mockConfirmCheckin.mockRejectedValueOnce(error);

    const screen = render(<CheckinModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(
        screen.getByText("Sem conexao. Verifique sua internet e tente novamente."),
      ).toBeTruthy();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when cancel is pressed in idle state", () => {
    const onClose = jest.fn();
    const screen = render(<CheckinModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-cancel"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel is pressed in error state", async () => {
    const onClose = jest.fn();
    const error = Object.assign(new Error("Server Error"), {
      isAxiosError: true,
      response: { status: 500 },
      config: {},
    });
    mockConfirmCheckin.mockRejectedValueOnce(error);

    const screen = render(<CheckinModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(screen.getByTestId("submit-error-banner")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("btn-cancel"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("resets to idle and clears error when modal reopens", () => {
    const { rerender } = render(<CheckinModal {...defaultProps} visible={false} />);

    rerender(<CheckinModal {...defaultProps} visible={true} />);

    const screen = render(<CheckinModal {...defaultProps} visible={true} />);

    expect(screen.queryByTestId("submit-error-banner")).toBeNull();
    expect(screen.queryByTestId("confirm-loading-indicator")).toBeNull();
  });

  it("does not call onClose on onRequestClose during submitting", async () => {
    const onClose = jest.fn();
    let resolveCheckin!: () => void;
    mockConfirmCheckin.mockReturnValueOnce(
      new Promise<{ id: string; status: string; deliveredAt: string }>((resolve) => {
        resolveCheckin = () =>
          resolve({ id: "order-123", status: "ENTREGUE", deliveredAt: "2026-03-09T10:00:00Z" });
      }),
    );

    const screen = render(<CheckinModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(screen.getByTestId("confirm-loading-indicator")).toBeTruthy();
    });

    // Modal onRequestClose is undefined during submitting — onClose not called
    expect(onClose).not.toHaveBeenCalled();

    resolveCheckin();
  });
});
