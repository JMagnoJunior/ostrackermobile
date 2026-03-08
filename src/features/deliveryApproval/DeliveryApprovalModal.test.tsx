import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import * as api from "./api";
import { DeliveryApprovalModal } from "./DeliveryApprovalModal";

const mockApproveDelivery = jest.spyOn(api, "approveDelivery");

const defaultProps = {
  visible: true,
  orderId: "order-123",
  orderLabel: "Joao Silva — AGENDADA_DELIVERY",
  onClose: jest.fn(),
  onSuccess: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DeliveryApprovalModal", () => {
  it("shows informative text, notes input, confirm and cancel buttons in idle state", () => {
    const screen = render(<DeliveryApprovalModal {...defaultProps} />);

    expect(screen.getByText("Aprovar Pedido Delivery")).toBeTruthy();
    expect(screen.getByTestId("input-notes")).toBeTruthy();
    expect(screen.getByTestId("btn-confirm")).toBeTruthy();
    expect(screen.getByTestId("btn-cancel")).toBeTruthy();
  });

  it("confirm button is enabled in idle state", () => {
    const screen = render(<DeliveryApprovalModal {...defaultProps} />);
    const confirmBtn = screen.getByTestId("btn-confirm");
    expect(confirmBtn.props.accessibilityState?.disabled).toBeFalsy();
  });

  it("calls onClose when cancel is pressed in idle state", () => {
    const onClose = jest.fn();
    const screen = render(<DeliveryApprovalModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-cancel"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onSuccess after successful approval", async () => {
    const onSuccess = jest.fn();
    mockApproveDelivery.mockResolvedValueOnce({
      id: "order-123",
      status: "ENTREGUE",
      approvedAt: "2026-03-08T20:00:00Z",
    });

    const screen = render(<DeliveryApprovalModal {...defaultProps} onSuccess={onSuccess} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("shows ActivityIndicator and disables buttons while submitting", async () => {
    let resolveApproval!: () => void;
    mockApproveDelivery.mockReturnValueOnce(
      new Promise<{ id: string; status: string; approvedAt: string }>((resolve) => {
        resolveApproval = () =>
          resolve({ id: "order-123", status: "ENTREGUE", approvedAt: "2026-03-08T20:00:00Z" });
      }),
    );

    const screen = render(<DeliveryApprovalModal {...defaultProps} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(screen.getByTestId("confirm-loading-indicator")).toBeTruthy();
    });

    const cancelBtn = screen.getByTestId("btn-cancel");
    expect(cancelBtn.props.accessibilityState?.disabled).toBe(true);

    const confirmBtn = screen.getByTestId("btn-confirm");
    expect(confirmBtn.props.accessibilityState?.disabled).toBe(true);

    resolveApproval();
  });

  it("shows 403 error message without calling onClose", async () => {
    const onClose = jest.fn();
    const error = Object.assign(new Error("Forbidden"), {
      isAxiosError: true,
      response: { status: 403 },
      config: {},
    });
    mockApproveDelivery.mockRejectedValueOnce(error);

    const screen = render(<DeliveryApprovalModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(screen.getByTestId("submit-error-banner")).toBeTruthy();
      expect(
        screen.getByText("Seu perfil nao tem permissao para aprovar pedidos de delivery."),
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
    mockApproveDelivery.mockRejectedValueOnce(error);

    const screen = render(<DeliveryApprovalModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(
        screen.getByText("OS nao encontrada. Atualize o dashboard e tente novamente."),
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
    mockApproveDelivery.mockRejectedValueOnce(error);

    const screen = render(<DeliveryApprovalModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(
        screen.getByText("Sem conexao. Verifique sua internet e tente novamente."),
      ).toBeTruthy();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when cancel is pressed in error state", async () => {
    const onClose = jest.fn();
    const error = Object.assign(new Error("Server Error"), {
      isAxiosError: true,
      response: { status: 500 },
      config: {},
    });
    mockApproveDelivery.mockRejectedValueOnce(error);

    const screen = render(<DeliveryApprovalModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(screen.getByTestId("submit-error-banner")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("btn-cancel"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows inline error when notes exceeds 300 characters", () => {
    const screen = render(<DeliveryApprovalModal {...defaultProps} />);

    const longText = "a".repeat(301);
    fireEvent.changeText(screen.getByTestId("input-notes"), longText);
    fireEvent.press(screen.getByTestId("btn-confirm"));

    expect(screen.getByTestId("error-notes")).toBeTruthy();
    expect(screen.getByText("Maximo de 300 caracteres.")).toBeTruthy();
    expect(mockApproveDelivery).not.toHaveBeenCalled();
  });

  it("omits notes from payload when field is empty", async () => {
    mockApproveDelivery.mockResolvedValueOnce({
      id: "order-123",
      status: "ENTREGUE",
      approvedAt: "2026-03-08T20:00:00Z",
    });

    const screen = render(<DeliveryApprovalModal {...defaultProps} />);

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(mockApproveDelivery).toHaveBeenCalledWith("order-123", {});
    });
  });

  it("omits notes from payload when field contains only whitespace", async () => {
    mockApproveDelivery.mockResolvedValueOnce({
      id: "order-123",
      status: "ENTREGUE",
      approvedAt: "2026-03-08T20:00:00Z",
    });

    const screen = render(<DeliveryApprovalModal {...defaultProps} />);

    fireEvent.changeText(screen.getByTestId("input-notes"), "   ");
    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(mockApproveDelivery).toHaveBeenCalledWith("order-123", {});
    });
  });

  it("includes notes in payload when field is filled", async () => {
    mockApproveDelivery.mockResolvedValueOnce({
      id: "order-123",
      status: "ENTREGUE",
      approvedAt: "2026-03-08T20:00:00Z",
    });

    const screen = render(<DeliveryApprovalModal {...defaultProps} />);

    fireEvent.changeText(screen.getByTestId("input-notes"), "Pix confirmado as 14h30.");
    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(mockApproveDelivery).toHaveBeenCalledWith("order-123", {
        notes: "Pix confirmado as 14h30.",
      });
    });
  });

  it("resets state when modal reopens", () => {
    const { rerender } = render(
      <DeliveryApprovalModal {...defaultProps} visible={false} />,
    );

    rerender(<DeliveryApprovalModal {...defaultProps} visible={true} />);

    const screen = render(<DeliveryApprovalModal {...defaultProps} visible={true} />);

    expect(screen.queryByTestId("submit-error-banner")).toBeNull();
    expect(screen.queryByTestId("error-notes")).toBeNull();
  });
});
