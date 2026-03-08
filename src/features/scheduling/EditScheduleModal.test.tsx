import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import { EditScheduleModal } from "./EditScheduleModal";

const mockUpdateOrderSchedule = jest.fn();
const mockGetScheduleErrorMessage = jest.fn();

jest.mock("./api", () => ({
  updateOrderSchedule: (...args: unknown[]) => mockUpdateOrderSchedule(...args),
  getScheduleErrorMessage: (...args: unknown[]) => mockGetScheduleErrorMessage(...args),
}));

const TODAY = new Date();
const tomorrowStr = [
  TODAY.getFullYear(),
  String(TODAY.getMonth() + 1).padStart(2, "0"),
  String(TODAY.getDate() + 1).padStart(2, "0"),
].join("-");

const defaultProps = {
  visible: true,
  orderId: "order-1",
  orderLabel: "Cliente Teste — AGENDADA_PRESENCIAL",
  onSuccess: jest.fn(),
  onClose: jest.fn(),
};

describe("EditScheduleModal", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetScheduleErrorMessage.mockReturnValue("Erro generico");
  });

  it("renders fields pre-filled when initialDate and initialShift provided", () => {
    const screen = render(
      <EditScheduleModal
        {...defaultProps}
        initialDate="2026-03-20"
        initialShift="TARDE"
      />,
    );

    expect(screen.getByTestId("input-scheduled-date").props.value).toBe("2026-03-20");
    expect(screen.getByTestId("shift-chip-TARDE").props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: "#0f766e" })]),
    );
  });

  it("disables save button when scheduledDate is empty", () => {
    const screen = render(
      <EditScheduleModal {...defaultProps} initialShift="MANHA" />,
    );

    const saveBtn = screen.getByTestId("btn-save");
    expect(saveBtn.props.accessibilityState?.disabled ?? saveBtn.props.disabled).toBeTruthy();
  });

  it("disables save button when scheduledShift is not selected", () => {
    const screen = render(
      <EditScheduleModal {...defaultProps} initialDate={tomorrowStr} />,
    );

    const saveBtn = screen.getByTestId("btn-save");
    expect(saveBtn.props.accessibilityState?.disabled ?? saveBtn.props.disabled).toBeTruthy();
  });

  it("selecting a shift chip updates visual selection", () => {
    const screen = render(<EditScheduleModal {...defaultProps} initialDate={tomorrowStr} />);

    fireEvent.press(screen.getByTestId("shift-chip-NOITE"));

    expect(screen.getByTestId("shift-chip-NOITE").props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: "#0f766e" })]),
    );
  });

  it("calls onSuccess after successful submission", async () => {
    mockUpdateOrderSchedule.mockResolvedValueOnce({
      id: "order-1",
      scheduledDate: tomorrowStr,
      scheduledShift: "MANHA",
      status: "AGENDADA_PRESENCIAL",
    });

    const onSuccess = jest.fn();
    const screen = render(
      <EditScheduleModal
        {...defaultProps}
        initialDate={tomorrowStr}
        initialShift="MANHA"
        onSuccess={onSuccess}
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("btn-save"));
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("shows error message without closing modal on 403", async () => {
    mockUpdateOrderSchedule.mockRejectedValueOnce(new Error("Forbidden"));
    mockGetScheduleErrorMessage.mockReturnValue(
      "Seu perfil nao tem permissao para editar agendamentos.",
    );

    const onClose = jest.fn();
    const screen = render(
      <EditScheduleModal
        {...defaultProps}
        initialDate={tomorrowStr}
        initialShift="TARDE"
        onClose={onClose}
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("btn-save"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("submit-error-banner")).toBeTruthy();
      expect(
        screen.getByText("Seu perfil nao tem permissao para editar agendamentos."),
      ).toBeTruthy();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when cancel button is pressed", () => {
    const onClose = jest.fn();
    const screen = render(<EditScheduleModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(screen.getByTestId("btn-cancel"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("disables save and cancel buttons while submitting", async () => {
    let resolve!: (value: unknown) => void;
    mockUpdateOrderSchedule.mockReturnValueOnce(
      new Promise((res) => {
        resolve = res;
      }),
    );

    const screen = render(
      <EditScheduleModal
        {...defaultProps}
        initialDate={tomorrowStr}
        initialShift="MANHA"
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("btn-save"));
    });

    expect(screen.getByTestId("save-loading-indicator")).toBeTruthy();
    expect(
      screen.getByTestId("btn-cancel").props.accessibilityState?.disabled ??
        screen.getByTestId("btn-cancel").props.disabled,
    ).toBeTruthy();

    await act(async () => {
      resolve({ id: "order-1", scheduledDate: tomorrowStr, scheduledShift: "MANHA", status: "AGENDADA_PRESENCIAL" });
    });
  });
});
