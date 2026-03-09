export const DASHBOARD_FILTERS = [
  "ATRASADOS",
  "SEM_AGENDAMENTO",
  "PROXIMOS_DESCARTES",
  "AGUARDANDO_CONFERENCIA",
  "AGENDADAS",
  "NO_SHOW",
] as const;

export type DashboardFilter = (typeof DASHBOARD_FILTERS)[number];

export type MonitoringStatusVolume = {
  status: string;
  count: number;
};

export type DashboardSummary = {
  atrasados: number;
  semAgendamento: number;
  proximosDescartes: number;
  aguardandoConferencia: number;
  agendadas: number;
  noShow: number;
  generatedAt: string;
  statusVolumes: MonitoringStatusVolume[];
};

export type DashboardOrderItem = {
  id: string;
  clientName: string;
  clientPhone: string;
  status: string;
  finishedAt: string;
  technicalSummary?: string;
  finalValue?: number;
  inactiveHours?: number;
  discardAt?: string;
  daysToDiscard?: number;
  monitoringFilter?: DashboardFilter;
  scheduledDate?: string;
  scheduledShift?: string;
};

export type DashboardOrderPage = {
  content: DashboardOrderItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type AsyncState<T> =
  | { kind: "idle" }
  | { kind: "loading"; lastData?: T }
  | { kind: "success"; data: T }
  | { kind: "error"; message: string; lastData?: T };

export type DashboardFilterCache = Partial<Record<DashboardFilter, DashboardOrderPage>>;
