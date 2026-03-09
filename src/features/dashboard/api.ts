import axios, { AxiosError } from "axios";

import { http } from "../../shared/api/http";
import {
  DASHBOARD_FILTERS,
  DashboardFilter,
  DashboardOrderItem,
  DashboardOrderPage,
  DashboardSummary,
  MonitoringStatusVolume,
} from "./types";

type DashboardSummaryResponseV1 = {
  generatedAt: unknown;
  counters?: {
    atrasados?: unknown;
    semAgendamento?: unknown;
    proximosDescartes?: unknown;
    aguardandoConferencia?: unknown;
    agendadas?: unknown;
    noShow?: unknown;
  };
  atrasados?: unknown;
  semAgendamento?: unknown;
  proximosDescartes?: unknown;
  aguardandoConferencia?: unknown;
  agendadas?: unknown;
  noShow?: unknown;
  statusVolumes?: unknown;
};

type DashboardOrderItemRaw = {
  id?: unknown;
  clientName?: unknown;
  clientPhone?: unknown;
  status?: unknown;
  finishedAt?: unknown;
  technicalSummary?: unknown;
  finalValue?: unknown;
  inactiveHours?: unknown;
  discardAt?: unknown;
  daysToDiscard?: unknown;
  monitoringFilter?: unknown;
  scheduledDate?: unknown;
  scheduledShift?: unknown;
};

type MonitoringPageResponse = {
  content?: unknown;
  page?: unknown;
  number?: unknown;
  size?: unknown;
  totalElements?: unknown;
  totalPages?: unknown;
  hasNext?: unknown;
  last?: unknown;
};

const MONITORING_SUMMARY_ENDPOINTS = [
  "/admin/orders/monitoring/summary",
  "/admin/orders/dashboard/summary",
] as const;

const MONITORING_LIST_ENDPOINTS = [
  "/admin/orders/monitoring",
  "/admin/orders/dashboard/orders",
] as const;

const CALL_QUEUE_ENDPOINT = "/admin/orders/call-queue";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeFilter(value: unknown): DashboardFilter | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  if ((DASHBOARD_FILTERS as readonly string[]).includes(value)) {
    return value as DashboardFilter;
  }

  return undefined;
}

function mapStatusVolumes(raw: unknown): MonitoringStatusVolume[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter(isObject)
    .map((item) => ({
      status: toStringValue(item["status"], ""),
      count: toNumber(item["count"]),
    }))
    .filter((v) => v.status !== "");
}

function mapSummaryResponse(payload: unknown): DashboardSummary {
  const data = isObject(payload) ? (payload as DashboardSummaryResponseV1) : {};
  const counters = isObject(data.counters) ? data.counters : undefined;

  return {
    atrasados: toNumber(counters?.atrasados ?? data.atrasados),
    semAgendamento: toNumber(counters?.semAgendamento ?? data.semAgendamento),
    proximosDescartes: toNumber(counters?.proximosDescartes ?? data.proximosDescartes),
    aguardandoConferencia: toNumber(counters?.aguardandoConferencia ?? data.aguardandoConferencia),
    agendadas: toNumber(counters?.agendadas ?? data.agendadas),
    noShow: toNumber(counters?.noShow ?? data.noShow),
    generatedAt:
      typeof data.generatedAt === "string"
        ? data.generatedAt
        : new Date().toISOString(),
    statusVolumes: mapStatusVolumes(data.statusVolumes),
  };
}

function mapOrderItem(raw: unknown, fallbackFilter: DashboardFilter): DashboardOrderItem {
  const item = isObject(raw) ? (raw as DashboardOrderItemRaw) : {};

  return {
    id: String(item.id ?? ""),
    clientName: toStringValue(item.clientName, "Cliente nao informado"),
    clientPhone: toStringValue(item.clientPhone, ""),
    status: toStringValue(item.status, "DESCONHECIDO"),
    finishedAt: toStringValue(item.finishedAt, ""),
    technicalSummary: toStringValue(item.technicalSummary, "") || undefined,
    finalValue: toOptionalNumber(item.finalValue),
    inactiveHours: toOptionalNumber(item.inactiveHours),
    discardAt: toStringValue(item.discardAt, "") || undefined,
    daysToDiscard: toOptionalNumber(item.daysToDiscard),
    monitoringFilter: normalizeFilter(item.monitoringFilter) ?? fallbackFilter,
    scheduledDate: toStringValue(item.scheduledDate, "") || undefined,
    scheduledShift: toStringValue(item.scheduledShift, "") || undefined,
  };
}

function mapOrdersResponse(
  payload: unknown,
  filter: DashboardFilter,
  page: number,
  size: number,
): DashboardOrderPage {
  const data = isObject(payload) ? (payload as MonitoringPageResponse) : {};
  const rawContent = Array.isArray(data.content) ? data.content : [];
  const mappedContent = rawContent.map((item) => mapOrderItem(item, filter));

  const responsePage = toNumber(data.page ?? data.number);
  const responseSize = toNumber(data.size);
  const totalElements = toNumber(data.totalElements);
  const totalPages = toNumber(data.totalPages);
  const hasNextFromApi =
    typeof data.hasNext === "boolean"
      ? data.hasNext
      : typeof data.last === "boolean"
        ? !data.last
        : responsePage + 1 < totalPages;

  return {
    content: mappedContent,
    page: Number.isFinite(responsePage) ? responsePage : page,
    size: Number.isFinite(responseSize) && responseSize > 0 ? responseSize : size,
    totalElements,
    totalPages,
    hasNext: hasNextFromApi,
  };
}

async function getSummaryWithEndpoint(endpoint: string): Promise<DashboardSummary> {
  const response = await http.get<DashboardSummaryResponseV1>(endpoint);
  return mapSummaryResponse(response.data);
}

async function getOrdersWithEndpoint(
  endpoint: string,
  filter: DashboardFilter,
  page: number,
  size: number,
  statuses?: Set<string>,
  referenceAt?: string,
): Promise<DashboardOrderPage> {
  const params: Record<string, unknown> = { filter, page, size };

  if (statuses && statuses.size > 0) {
    params["status"] = Array.from(statuses);
  }

  if (referenceAt !== undefined) {
    params["referenceAt"] = referenceAt;
  }

  const response = await http.get<MonitoringPageResponse>(endpoint, { params });

  return mapOrdersResponse(response.data, filter, page, size);
}

async function getCallQueueFallbackSummary(): Promise<DashboardSummary> {
  const response = await http.get<MonitoringPageResponse>(CALL_QUEUE_ENDPOINT, {
    params: {
      page: 0,
      size: 1,
    },
  });

  const totalElements = toNumber(response.data.totalElements);

  return {
    atrasados: totalElements,
    semAgendamento: 0,
    proximosDescartes: 0,
    aguardandoConferencia: 0,
    agendadas: 0,
    noShow: 0,
    generatedAt: new Date().toISOString(),
    statusVolumes: [],
  };
}

async function getCallQueueFallbackPage(
  page: number,
  size: number,
): Promise<DashboardOrderPage> {
  const response = await http.get<MonitoringPageResponse>(CALL_QUEUE_ENDPOINT, {
    params: {
      page,
      size,
    },
  });

  return mapOrdersResponse(response.data, "ATRASADOS", page, size);
}

function isHttpNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  let lastError: unknown;

  for (const endpoint of MONITORING_SUMMARY_ENDPOINTS) {
    try {
      return await getSummaryWithEndpoint(endpoint);
    } catch (error) {
      if (isHttpNotFound(error)) {
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  try {
    return await getCallQueueFallbackSummary();
  } catch {
    if (lastError) {
      throw lastError;
    }

    throw new Error("Unable to load dashboard summary");
  }
}

export async function getDashboardOrders(
  filter: DashboardFilter,
  page = 0,
  size = 20,
  statuses?: Set<string>,
  referenceAt?: string,
): Promise<DashboardOrderPage> {
  let lastError: unknown;

  for (const endpoint of MONITORING_LIST_ENDPOINTS) {
    try {
      return await getOrdersWithEndpoint(endpoint, filter, page, size, statuses, referenceAt);
    } catch (error) {
      if (isHttpNotFound(error)) {
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  if (filter === "ATRASADOS") {
    return getCallQueueFallbackPage(page, size);
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Unable to load dashboard orders");
}

export function getDashboardErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Nao foi possivel carregar o dashboard. Tente novamente.";
  }

  const status = error.response?.status;

  if (!status) {
    return "Servico indisponivel no momento. Tente novamente em instantes.";
  }

  if (status === 403) {
    return "Seu perfil nao possui acesso ao dashboard da secretaria.";
  }

  if (status === 422 || status === 400) {
    return "Nao foi possivel aplicar o filtro selecionado.";
  }

  if (status >= 500) {
    return "Servico indisponivel no momento. Tente novamente em instantes.";
  }

  if (status === 404) {
    return "Dashboard ainda nao disponivel no backend para este filtro.";
  }

  return "Nao foi possivel carregar o dashboard. Tente novamente.";
}

export function isForbiddenDashboardError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error) && error.response?.status === 403;
}
