import {
  AsyncState,
  DashboardFilter,
  DashboardOrderItem,
  DashboardOrderPage,
} from "./types";

const FILTER_LABELS: Record<DashboardFilter, string> = {
  ATRASADOS: "Atrasados",
  SEM_AGENDAMENTO: "Sem agendamento",
  PROXIMOS_DESCARTES: "Proximos descartes",
};

const EMPTY_MESSAGES: Record<DashboardFilter, string> = {
  ATRASADOS: "Nenhuma OS atrasada no momento.",
  SEM_AGENDAMENTO: "Nenhuma OS sem agendamento no momento.",
  PROXIMOS_DESCARTES: "Nenhuma OS proxima do descarte no momento.",
};

export function getFilterLabel(filter: DashboardFilter): string {
  return FILTER_LABELS[filter];
}

export function getEmptyMessage(filter: DashboardFilter): string {
  return EMPTY_MESSAGES[filter];
}

export function getAsyncStateData<T>(state: AsyncState<T>): T | undefined {
  if (state.kind === "success") {
    return state.data;
  }

  if (state.kind === "loading" || state.kind === "error") {
    return state.lastData;
  }

  return undefined;
}

function keepFirstItemsById(items: DashboardOrderItem[]): DashboardOrderItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

export function mergeDashboardPages(
  previousPage: DashboardOrderPage,
  nextPage: DashboardOrderPage,
): DashboardOrderPage {
  return {
    ...nextPage,
    content: keepFirstItemsById([...previousPage.content, ...nextPage.content]),
  };
}
