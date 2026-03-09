import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import * as checkinApi from "../checkin/api";
import { SecretaryDashboardScreen } from "./SecretaryDashboardScreen";
import { DashboardFilter, DashboardOrderPage } from "./types";

const mockGetDashboardSummary = jest.fn();
const mockGetDashboardOrders = jest.fn();
const mockGetDashboardErrorMessage = jest.fn();
const mockConfirmCheckin = jest.spyOn(checkinApi, "confirmCheckin");

jest.mock("./api", () => ({
  getDashboardSummary: (...args: unknown[]) => mockGetDashboardSummary(...args),
  getDashboardOrders: (...args: unknown[]) => mockGetDashboardOrders(...args),
  getDashboardErrorMessage: (...args: unknown[]) => mockGetDashboardErrorMessage(...args),
}));

function buildPage(filter: DashboardFilter, contentSize: number, status = "FINALIZADA"): DashboardOrderPage {
  return {
    content: Array.from({ length: contentSize }).map((_, index) => ({
      id: `${filter}-order-${index}`,
      clientName: `Cliente ${index}`,
      clientPhone: "5511999990000",
      status,
      finishedAt: "2026-03-05T10:00:00Z",
      monitoringFilter: filter,
    })),
    page: 0,
    size: 20,
    totalElements: contentSize,
    totalPages: contentSize > 0 ? 1 : 0,
    hasNext: false,
  };
}

describe("SecretaryDashboardScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockConfirmCheckin.mockResolvedValue({
      id: "order-123",
      status: "ENTREGUE",
      deliveredAt: "2026-03-09T10:00:00Z",
    });

    mockGetDashboardSummary.mockResolvedValue({
      generatedAt: "2026-03-08T12:00:00Z",
      atrasados: 3,
      semAgendamento: 1,
      proximosDescartes: 0,
    });
    mockGetDashboardErrorMessage.mockReturnValue("Falha ao carregar");
  });

  it("renders loaded data", async () => {
    mockGetDashboardOrders.mockResolvedValueOnce(buildPage("ATRASADOS", 1));

    const screen = render(<SecretaryDashboardScreen />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard da secretaria")).toBeTruthy();
      expect(screen.getByText("Cliente 0")).toBeTruthy();
    });
  });

  it("shows list error and retries successfully", async () => {
    mockGetDashboardOrders
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(buildPage("ATRASADOS", 1));

    const screen = render(<SecretaryDashboardScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("list-state-error")).toBeTruthy();
      expect(screen.getByText("Falha ao carregar")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Tentar novamente"));

    await waitFor(() => {
      expect(screen.getByText("Cliente 0")).toBeTruthy();
    });
  });

  it("opens CheckinModal when btn-checkin is tapped on AGENDADA_PRESENCIAL item", async () => {
    mockGetDashboardOrders.mockResolvedValueOnce(
      buildPage("ATRASADOS", 1, "AGENDADA_PRESENCIAL"),
    );

    const screen = render(<SecretaryDashboardScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("btn-checkin")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("btn-checkin"));

    await waitFor(() => {
      // Modal opens: modal has btn-confirm testID
      expect(screen.getByTestId("btn-confirm")).toBeTruthy();
    });
  });

  it("calls refreshCurrentData after successful checkin", async () => {
    mockGetDashboardOrders
      .mockResolvedValueOnce(buildPage("ATRASADOS", 1, "AGENDADA_PRESENCIAL"))
      .mockResolvedValue(buildPage("ATRASADOS", 0));

    const screen = render(<SecretaryDashboardScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("btn-checkin")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("btn-checkin"));

    await waitFor(() => {
      expect(screen.getByTestId("btn-confirm")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("btn-confirm"));

    await waitFor(() => {
      expect(mockConfirmCheckin).toHaveBeenCalledTimes(1);
      expect(mockGetDashboardOrders).toHaveBeenCalledTimes(2);
    });
  });

  it("changes filter and displays empty state", async () => {
    mockGetDashboardOrders
      .mockResolvedValueOnce(buildPage("ATRASADOS", 1))
      .mockResolvedValueOnce(buildPage("SEM_AGENDAMENTO", 0));

    const screen = render(<SecretaryDashboardScreen />);

    await waitFor(() => {
      expect(screen.getByText("Cliente 0")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("filter-chip-SEM_AGENDAMENTO"));

    await waitFor(() => {
      expect(screen.getByTestId("list-state-empty")).toBeTruthy();
      expect(screen.getByText("Nenhuma OS sem agendamento no momento. Toque para atualizar.")).toBeTruthy();
    });
  });
});
