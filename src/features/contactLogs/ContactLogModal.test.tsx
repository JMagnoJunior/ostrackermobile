import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import { ContactLogModal } from "./ContactLogModal";

const mockGetContactLogs = jest.fn();
const mockCreateContactLog = jest.fn();
const mockGetContactLogErrorMessage = jest.fn();

jest.mock("./api", () => ({
  getContactLogs: (...args: unknown[]) => mockGetContactLogs(...args),
  createContactLog: (...args: unknown[]) => mockCreateContactLog(...args),
  getContactLogErrorMessage: (...args: unknown[]) => mockGetContactLogErrorMessage(...args),
}));

const defaultProps = {
  visible: true,
  orderId: "order-abc",
  orderLabel: "Cliente Teste — FINALIZADA",
  onClose: jest.fn(),
};

function buildLog(overrides?: object) {
  return {
    id: "log-1",
    orderId: "order-abc",
    note: "Liguei para o cliente",
    author: "Secretaria",
    createdAt: "2026-03-08T10:00:00Z",
    ...overrides,
  };
}

describe("ContactLogModal", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    mockGetContactLogErrorMessage.mockImplementation(
      (_error: unknown, context: "list" | "create") =>
        context === "list" ? "Erro ao carregar historico." : "Erro ao registrar.",
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows ActivityIndicator while loading history", () => {
    mockGetContactLogs.mockReturnValue(new Promise(() => {})); // never resolves

    const screen = render(<ContactLogModal {...defaultProps} />);

    expect(screen.getByTestId("history-loading-indicator")).toBeTruthy();
  });

  it("shows list of logs after successful load", async () => {
    mockGetContactLogs.mockResolvedValueOnce([
      buildLog({ note: "Primeira nota", author: "Ana" }),
      buildLog({ id: "log-2", note: "Segunda nota", author: "Bia" }),
    ]);

    const screen = render(<ContactLogModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Primeira nota")).toBeTruthy();
      expect(screen.getByText("Segunda nota")).toBeTruthy();
    });

    expect(screen.getByTestId("history-log-list")).toBeTruthy();
  });

  it("shows empty state when no logs exist", async () => {
    mockGetContactLogs.mockResolvedValueOnce([]);

    const screen = render(<ContactLogModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("history-empty")).toBeTruthy();
    });
  });

  it("shows history error with retry button when getContactLogs fails", async () => {
    mockGetContactLogs.mockRejectedValueOnce(new Error("network error"));

    const screen = render(<ContactLogModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("history-error-container")).toBeTruthy();
      expect(screen.getByTestId("btn-retry-history")).toBeTruthy();
    });
  });

  it("retries history load when retry button is pressed", async () => {
    mockGetContactLogs
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce([buildLog({ note: "Recuperado" })]);

    const screen = render(<ContactLogModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("btn-retry-history")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("btn-retry-history"));

    await waitFor(() => {
      expect(screen.getByText("Recuperado")).toBeTruthy();
    });
  });

  it("save button is disabled when note is empty", async () => {
    mockGetContactLogs.mockResolvedValueOnce([]);

    const screen = render(<ContactLogModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("history-empty")).toBeTruthy();
    });

    const saveBtn = screen.getByTestId("btn-save");
    expect(saveBtn.props.accessibilityState?.disabled ?? saveBtn.props.disabled).toBeTruthy();
  });

  it("save button is enabled when note has valid text", async () => {
    mockGetContactLogs.mockResolvedValueOnce([]);

    const screen = render(<ContactLogModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("history-empty")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId("input-note"), "nota valida");

    const saveBtn = screen.getByTestId("btn-save");
    // disabled prop should be false/undefined when enabled
    const isDisabled = saveBtn.props.accessibilityState?.disabled ?? saveBtn.props.disabled;
    expect(isDisabled).toBeFalsy();
  });

  it("save button is disabled when note contains only whitespace", async () => {
    mockGetContactLogs.mockResolvedValueOnce([]);

    const screen = render(<ContactLogModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("history-empty")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId("input-note"), "   ");

    const saveBtn = screen.getByTestId("btn-save");
    const isDisabled = saveBtn.props.accessibilityState?.disabled ?? saveBtn.props.disabled;
    expect(isDisabled).toBeTruthy();
  });

  it("shows success banner and reloads history after successful submission", async () => {
    const newLog = buildLog({ id: "log-new", note: "Novo contato registrado" });
    mockGetContactLogs
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([newLog]);
    mockCreateContactLog.mockResolvedValueOnce(newLog);

    const screen = render(<ContactLogModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("history-empty")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId("input-note"), "Novo contato registrado");
    fireEvent.press(screen.getByTestId("btn-save"));

    await waitFor(() => {
      expect(screen.getByTestId("success-banner")).toBeTruthy();
    });

    // After 2 seconds, history reloads
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByText("Novo contato registrado")).toBeTruthy();
    });
  });

  it("shows 403 error banner without closing modal on create", async () => {
    const axiosError = { response: { status: 403 }, isAxiosError: true, message: "Forbidden" };
    mockGetContactLogs.mockResolvedValueOnce([]);
    mockCreateContactLog.mockRejectedValueOnce(axiosError);
    mockGetContactLogErrorMessage.mockReturnValueOnce("Sem permissao para visualizar o historico desta OS.");
    mockGetContactLogErrorMessage.mockReturnValueOnce("Seu perfil nao tem permissao para registrar contatos.");

    const onClose = jest.fn();
    const screen = render(<ContactLogModal {...defaultProps} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId("history-empty")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId("input-note"), "tentativa");
    fireEvent.press(screen.getByTestId("btn-save"));

    await waitFor(() => {
      expect(screen.getByTestId("submit-error-banner")).toBeTruthy();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows 5xx error banner without closing modal on create", async () => {
    mockGetContactLogs.mockResolvedValueOnce([]);
    mockCreateContactLog.mockRejectedValueOnce(new Error("server error"));

    const onClose = jest.fn();
    const screen = render(<ContactLogModal {...defaultProps} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId("history-empty")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId("input-note"), "tentativa");
    fireEvent.press(screen.getByTestId("btn-save"));

    await waitFor(() => {
      expect(screen.getByTestId("submit-error-banner")).toBeTruthy();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("close button calls onClose in idle state", async () => {
    mockGetContactLogs.mockResolvedValueOnce([]);

    const onClose = jest.fn();
    const screen = render(<ContactLogModal {...defaultProps} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId("history-empty")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("btn-close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("close button is disabled during submitting", async () => {
    mockGetContactLogs.mockResolvedValueOnce([]);
    mockCreateContactLog.mockReturnValue(new Promise(() => {})); // never resolves

    const screen = render(<ContactLogModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("history-empty")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId("input-note"), "valido");
    fireEvent.press(screen.getByTestId("btn-save"));

    await waitFor(() => {
      expect(screen.getByTestId("save-loading-indicator")).toBeTruthy();
    });

    const closeBtn = screen.getByTestId("btn-close");
    const isDisabled = closeBtn.props.accessibilityState?.disabled ?? closeBtn.props.disabled;
    expect(isDisabled).toBeTruthy();
  });

  it("tapping backdrop calls onClose in idle state", async () => {
    mockGetContactLogs.mockResolvedValueOnce([]);

    const onClose = jest.fn();
    const screen = render(<ContactLogModal {...defaultProps} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId("history-empty")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("modal-backdrop"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("tapping backdrop does NOT call onClose during submitting", async () => {
    mockGetContactLogs.mockResolvedValueOnce([]);
    mockCreateContactLog.mockReturnValue(new Promise(() => {})); // never resolves

    const onClose = jest.fn();
    const screen = render(<ContactLogModal {...defaultProps} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByTestId("history-empty")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId("input-note"), "valido");
    fireEvent.press(screen.getByTestId("btn-save"));

    await waitFor(() => {
      expect(screen.getByTestId("save-loading-indicator")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("modal-backdrop"));

    expect(onClose).not.toHaveBeenCalled();
  });
});
