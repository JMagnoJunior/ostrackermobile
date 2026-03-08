import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import { SecretaryDashboardScreen } from "./SecretaryDashboardScreen";
import { DashboardFilter, DashboardOrderPage } from "./types";

const mockGetDashboardSummary = jest.fn();
const mockGetDashboardOrders = jest.fn();
const mockGetDashboardErrorMessage = jest.fn();

jest.mock("./api", () => ({
  getDashboardSummary: (...args: unknown[]) => mockGetDashboardSummary(...args),
  getDashboardOrders: (...args: unknown[]) => mockGetDashboardOrders(...args),
  getDashboardErrorMessage: (...args: unknown[]) => mockGetDashboardErrorMessage(...args),
}));

function buildPage(filter: DashboardFilter, contentSize: number): DashboardOrderPage {
  return {
    content: Array.from({ length: contentSize }).map((_, index) => ({
      id: `${filter}-order-${index}`,
      clientName: `Cliente ${index}`,
      clientPhone: "5511999990000",
      status: "FINALIZADA",
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
