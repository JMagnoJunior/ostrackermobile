import { AxiosError } from "axios";

import {
  getDashboardErrorMessage,
  getDashboardOrders,
  getDashboardSummary,
} from "./api";

const mockHttpGet = jest.fn();

jest.mock("../../shared/api/http", () => ({
  http: {
    get: (...args: unknown[]) => mockHttpGet(...args),
  },
}));

function buildAxiosError(status?: number): AxiosError {
  return new AxiosError(
    "request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    status
      ? ({
          status,
          statusText: "error",
          headers: {},
          config: { headers: {} },
          data: {},
        } as any)
      : undefined,
  );
}

describe("dashboard api", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("maps summary payload with nested counters", async () => {
    mockHttpGet.mockResolvedValueOnce({
      data: {
        generatedAt: "2026-03-08T12:00:00Z",
        counters: {
          atrasados: 5,
          semAgendamento: 7,
          proximosDescartes: 2,
        },
      },
    });

    const result = await getDashboardSummary();

    expect(result).toEqual({
      generatedAt: "2026-03-08T12:00:00Z",
      atrasados: 5,
      semAgendamento: 7,
      proximosDescartes: 2,
    });
    expect(mockHttpGet).toHaveBeenCalledWith("/admin/orders/monitoring/summary");
  });

  it("maps monitoring page payload", async () => {
    mockHttpGet.mockResolvedValueOnce({
      data: {
        content: [
          {
            id: "order-1",
            clientName: "Cliente 1",
            clientPhone: "5511999990001",
            status: "FINALIZADA",
            finishedAt: "2026-03-01T10:00:00Z",
            inactiveHours: 40,
            monitoringFilter: "ATRASADOS",
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
      },
    });

    const result = await getDashboardOrders("ATRASADOS");

    expect(result.totalElements).toBe(1);
    expect(result.content[0]).toMatchObject({
      id: "order-1",
      monitoringFilter: "ATRASADOS",
    });
    expect(mockHttpGet).toHaveBeenCalledWith("/admin/orders/monitoring", {
      params: {
        filter: "ATRASADOS",
        page: 0,
        size: 20,
      },
    });
  });

  it("falls back to call-queue when monitoring endpoints are unavailable for ATRASADOS", async () => {
    mockHttpGet
      .mockRejectedValueOnce(buildAxiosError(404))
      .mockRejectedValueOnce(buildAxiosError(404))
      .mockResolvedValueOnce({
        data: {
          content: [
            {
              id: "call-1",
              clientName: "Cliente fallback",
              clientPhone: "5511999990000",
              status: "FINALIZADA",
              finishedAt: "2026-03-01T10:00:00Z",
              inactiveHours: 80,
            },
          ],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
          hasNext: false,
        },
      });

    const result = await getDashboardOrders("ATRASADOS", 0, 20);

    expect(result.content[0]).toMatchObject({
      id: "call-1",
      monitoringFilter: "ATRASADOS",
    });
    expect(mockHttpGet).toHaveBeenNthCalledWith(3, "/admin/orders/call-queue", {
      params: {
        page: 0,
        size: 20,
      },
    });
  });

  it("does not use call-queue fallback for non-ATRASADOS filter", async () => {
    mockHttpGet
      .mockRejectedValueOnce(buildAxiosError(404))
      .mockRejectedValueOnce(buildAxiosError(404));

    await expect(getDashboardOrders("SEM_AGENDAMENTO")).rejects.toBeTruthy();

    expect(mockHttpGet).toHaveBeenCalledTimes(2);
  });

  it("mapOrderItem maps scheduledDate and scheduledShift when present", async () => {
    mockHttpGet.mockResolvedValueOnce({
      data: {
        content: [
          {
            id: "order-sched",
            clientName: "Cliente Agendado",
            clientPhone: "5511999990002",
            status: "AGENDADA_PRESENCIAL",
            finishedAt: "2026-03-01T10:00:00Z",
            scheduledDate: "2026-03-20",
            scheduledShift: "TARDE",
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
      },
    });

    const result = await getDashboardOrders("ATRASADOS");

    expect(result.content[0].scheduledDate).toBe("2026-03-20");
    expect(result.content[0].scheduledShift).toBe("TARDE");
  });

  it("mapOrderItem returns undefined for scheduledDate and scheduledShift when absent", async () => {
    mockHttpGet.mockResolvedValueOnce({
      data: {
        content: [
          {
            id: "order-no-sched",
            clientName: "Cliente Sem Agendamento",
            clientPhone: "5511999990003",
            status: "FINALIZADA",
            finishedAt: "2026-03-01T10:00:00Z",
          },
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
      },
    });

    const result = await getDashboardOrders("ATRASADOS");

    expect(result.content[0].scheduledDate).toBeUndefined();
    expect(result.content[0].scheduledShift).toBeUndefined();
  });
});

describe("getDashboardErrorMessage", () => {
  it("returns forbidden message for 403", () => {
    expect(getDashboardErrorMessage(buildAxiosError(403))).toContain(
      "nao possui acesso ao dashboard",
    );
  });

  it("returns filter message for 422", () => {
    expect(getDashboardErrorMessage(buildAxiosError(422))).toContain(
      "aplicar o filtro selecionado",
    );
  });

  it("returns unavailable message for network errors", () => {
    expect(getDashboardErrorMessage(buildAxiosError())).toContain(
      "Servico indisponivel",
    );
  });
});
