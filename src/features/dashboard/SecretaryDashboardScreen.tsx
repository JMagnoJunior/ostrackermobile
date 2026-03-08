import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ContactLogModal } from "../contactLogs/ContactLogModal";
import { EditScheduleModal } from "../scheduling/EditScheduleModal";
import { ScheduledShift } from "../scheduling/types";

import {
  getDashboardErrorMessage,
  getDashboardOrders,
  getDashboardSummary,
} from "./api";
import { FilterChips } from "./components/FilterChips";
import { ListStateView } from "./components/ListStateView";
import { OrderListItem } from "./components/OrderListItem";
import { StatusIndicators } from "./components/StatusIndicators";
import {
  getAsyncStateData,
  getEmptyMessage,
  getFilterLabel,
  mergeDashboardPages,
} from "./state";
import {
  AsyncState,
  DashboardFilter,
  DashboardFilterCache,
  DashboardOrderItem,
  DashboardOrderPage,
  DashboardSummary,
} from "./types";

const DEFAULT_FILTER: DashboardFilter = "ATRASADOS";
const PAGE_SIZE = 20;

type LoadMode = {
  preserveData: boolean;
};

export function SecretaryDashboardScreen() {
  const [selectedFilter, setSelectedFilter] = useState<DashboardFilter>(DEFAULT_FILTER);
  const [summaryState, setSummaryState] = useState<AsyncState<DashboardSummary>>({
    kind: "loading",
  });
  const [listState, setListState] = useState<AsyncState<DashboardOrderPage>>({
    kind: "loading",
  });
  const [filterCache, setFilterCache] = useState<DashboardFilterCache>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [incrementalError, setIncrementalError] = useState<string | null>(null);

  type ScheduleEditTarget = {
    orderId: string;
    orderLabel: string;
    initialDate?: string;
    initialShift?: ScheduledShift;
  } | null;

  const [scheduleEditTarget, setScheduleEditTarget] = useState<ScheduleEditTarget>(null);

  const selectedFilterRef = useRef<DashboardFilter>(selectedFilter);
  const listStateRef = useRef<AsyncState<DashboardOrderPage>>(listState);
  const filterCacheRef = useRef<DashboardFilterCache>(filterCache);

  useEffect(() => {
    selectedFilterRef.current = selectedFilter;
  }, [selectedFilter]);

  useEffect(() => {
    listStateRef.current = listState;
  }, [listState]);

  useEffect(() => {
    filterCacheRef.current = filterCache;
  }, [filterCache]);

  const updateFilterCache = useCallback(
    (filter: DashboardFilter, page: DashboardOrderPage) => {
      setFilterCache((previous) => {
        const next = {
          ...previous,
          [filter]: page,
        };

        filterCacheRef.current = next;
        return next;
      });
    },
    [setFilterCache],
  );

  const loadSummary = useCallback(async ({ preserveData }: LoadMode) => {
    setSummaryState((previous) => ({
      kind: "loading",
      lastData: preserveData ? getAsyncStateData(previous) : undefined,
    }));

    try {
      const summary = await getDashboardSummary();
      setSummaryState({ kind: "success", data: summary });
    } catch (error) {
      const message = getDashboardErrorMessage(error);
      setSummaryState((previous) => ({
        kind: "error",
        message,
        lastData: preserveData ? getAsyncStateData(previous) : undefined,
      }));
    }
  }, []);

  const loadFirstPage = useCallback(
    async (filter: DashboardFilter, { preserveData }: LoadMode) => {
      setIncrementalError(null);

      setListState((previous) => {
        const cached = filterCacheRef.current[filter];
        const previousData = preserveData
          ? cached ?? getAsyncStateData(previous)
          : cached;

        return {
          kind: "loading",
          lastData: previousData,
        };
      });

      try {
        const page = await getDashboardOrders(filter, 0, PAGE_SIZE);
        updateFilterCache(filter, page);

        if (selectedFilterRef.current === filter) {
          setListState({ kind: "success", data: page });
        }
      } catch (error) {
        const message = getDashboardErrorMessage(error);

        if (selectedFilterRef.current !== filter) {
          return;
        }

        setListState((previous) => ({
          kind: "error",
          message,
          lastData: preserveData
            ? filterCacheRef.current[filter] ?? getAsyncStateData(previous)
            : undefined,
        }));
      }
    },
    [updateFilterCache],
  );

  const loadNextPage = useCallback(async () => {
    if (isLoadingMore) {
      return;
    }

    const currentPage = getAsyncStateData(listStateRef.current);
    if (!currentPage || !currentPage.hasNext) {
      return;
    }

    setIsLoadingMore(true);
    setIncrementalError(null);

    try {
      const nextPage = await getDashboardOrders(
        selectedFilterRef.current,
        currentPage.page + 1,
        PAGE_SIZE,
      );

      const mergedPage = mergeDashboardPages(currentPage, nextPage);
      updateFilterCache(selectedFilterRef.current, mergedPage);
      setListState({ kind: "success", data: mergedPage });
    } catch (error) {
      setIncrementalError(getDashboardErrorMessage(error));
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, updateFilterCache]);

  const refreshCurrentData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadSummary({ preserveData: true }),
      loadFirstPage(selectedFilterRef.current, { preserveData: true }),
    ]);
    setIsRefreshing(false);
  }, [loadFirstPage, loadSummary]);

  const retryInitialLoad = useCallback(async () => {
    await Promise.all([
      loadSummary({ preserveData: true }),
      loadFirstPage(selectedFilterRef.current, { preserveData: true }),
    ]);
  }, [loadFirstPage, loadSummary]);

  const onSelectFilter = useCallback(
    (filter: DashboardFilter) => {
      if (filter === selectedFilterRef.current) {
        return;
      }

      selectedFilterRef.current = filter;
      setSelectedFilter(filter);
      setIncrementalError(null);

      const cached = filterCacheRef.current[filter];
      if (cached) {
        setListState({ kind: "success", data: cached });
      }

      void loadFirstPage(filter, { preserveData: true });
    },
    [loadFirstPage],
  );

  useEffect(() => {
    void Promise.all([
      loadSummary({ preserveData: false }),
      loadFirstPage(DEFAULT_FILTER, { preserveData: false }),
    ]);
  }, [loadFirstPage, loadSummary]);

  const summaryData = getAsyncStateData(summaryState);
  const listPage = getAsyncStateData(listState);
  const listItems = listPage?.content ?? [];

  const showSummaryPartialError =
    summaryState.kind === "error" &&
    summaryData !== undefined &&
    (listState.kind === "success" || listItems.length > 0);

  const showListPartialError =
    listState.kind === "error" &&
    listPage !== undefined &&
    listPage.content.length > 0;

  const header = useMemo(
    () => (
      <View>
        <Text style={styles.title}>Dashboard da secretaria</Text>
        <Text style={styles.subtitle}>
          Monitore OS por prioridade operacional e tome acoes rapidas.
        </Text>

        {summaryData?.generatedAt ? (
          <Text style={styles.generatedAt}>Atualizado em: {summaryData.generatedAt}</Text>
        ) : null}

        {showSummaryPartialError ? (
          <Text style={styles.partialErrorBanner}>{summaryState.message}</Text>
        ) : null}

        <StatusIndicators
          isLoading={summaryState.kind === "loading" && summaryData === undefined}
          onSelectFilter={onSelectFilter}
          selectedFilter={selectedFilter}
          summary={summaryData}
        />

        <FilterChips onSelectFilter={onSelectFilter} selectedFilter={selectedFilter} />

        {showListPartialError ? (
          <Text style={styles.partialErrorBanner}>{listState.message}</Text>
        ) : null}
      </View>
    ),
    [
      listState,
      onSelectFilter,
      selectedFilter,
      showListPartialError,
      showSummaryPartialError,
      summaryData,
      summaryState,
    ],
  );

  const handleEditSchedule = useCallback(
    (item: DashboardOrderItem) => {
      const orderLabel = `${item.clientName} — ${item.status}`;
      setScheduleEditTarget({
        orderId: item.id,
        orderLabel,
        initialDate: item.scheduledDate,
        initialShift: item.scheduledShift as ScheduledShift | undefined,
      });
    },
    [],
  );

  const handleScheduleModalSuccess = useCallback(() => {
    setScheduleEditTarget(null);
    void refreshCurrentData();
  }, [refreshCurrentData]);

  const handleScheduleModalClose = useCallback(() => {
    setScheduleEditTarget(null);
  }, []);

  const renderItem: ListRenderItem<DashboardOrderItem> = useCallback(
    ({ item }) => (
      <OrderListItem
        item={item}
        onEditSchedule={() => handleEditSchedule(item)}
        selectedFilter={selectedFilter}
      />
    ),
    [selectedFilter, handleEditSchedule],
  );

  const listEmptyComponent = useMemo(() => {
    if (listState.kind === "loading" && listPage === undefined) {
      return <ListStateView message="Carregando OS..." mode="loading" />;
    }

    if (listState.kind === "error" && listPage === undefined) {
      return (
        <ListStateView
          message={listState.message}
          mode="error"
          onRetry={() => {
            void retryInitialLoad();
          }}
        />
      );
    }

    return (
      <ListStateView
        message={`${getEmptyMessage(selectedFilter)} Toque para atualizar.`}
        mode="empty"
        onRetry={() => {
          void refreshCurrentData();
        }}
      />
    );
  }, [listPage, listState, refreshCurrentData, retryInitialLoad, selectedFilter]);

  const listFooterComponent = useMemo(() => {
    if (isLoadingMore) {
      return <ListStateView message="Carregando mais resultados..." mode="loading" />;
    }

    if (incrementalError) {
      return (
        <View style={styles.footerRetryContainer}>
          <Text style={styles.footerErrorText}>{incrementalError}</Text>
          <Pressable
            onPress={() => {
              void loadNextPage();
            }}
            style={styles.footerRetryButton}
          >
            <Text style={styles.footerRetryButtonText}>Repetir</Text>
          </Pressable>
        </View>
      );
    }

    if (listItems.length > 0 && listPage?.hasNext === false) {
      return <Text style={styles.footerDoneText}>Fim da lista de {getFilterLabel(selectedFilter)}.</Text>;
    }

    return null;
  }, [incrementalError, isLoadingMore, listItems.length, listPage?.hasNext, loadNextPage, selectedFilter]);

  return (
    <>
      <FlatList
        contentContainerStyle={styles.contentContainer}
        data={listItems}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={listFooterComponent}
        ListHeaderComponent={header}
        onEndReached={() => {
          void loadNextPage();
        }}
        onEndReachedThreshold={0.3}
        onRefresh={() => {
          void refreshCurrentData();
        }}
        refreshing={isRefreshing}
        renderItem={renderItem}
        testID="dashboard-order-list"
      />
      {scheduleEditTarget ? (
        <EditScheduleModal
          initialDate={scheduleEditTarget.initialDate}
          initialShift={scheduleEditTarget.initialShift}
          onClose={handleScheduleModalClose}
          onSuccess={handleScheduleModalSuccess}
          orderId={scheduleEditTarget.orderId}
          orderLabel={scheduleEditTarget.orderLabel}
          visible={scheduleEditTarget !== null}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    color: "#0f172a",
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: "#334155",
    fontSize: 14,
    marginBottom: 10,
    marginTop: 4,
  },
  generatedAt: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 10,
  },
  partialErrorBanner: {
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    color: "#92400e",
    marginBottom: 10,
    padding: 10,
  },
  footerRetryContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  footerErrorText: {
    color: "#991b1b",
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
  },
  footerRetryButton: {
    backgroundColor: "#0f766e",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  footerRetryButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  footerDoneText: {
    color: "#64748b",
    fontSize: 12,
    marginVertical: 8,
    textAlign: "center",
  },
});
