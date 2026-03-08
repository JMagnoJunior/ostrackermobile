import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getFilterLabel } from "../state";
import { DashboardFilter, DashboardSummary } from "../types";

type StatusIndicatorsProps = {
  summary?: DashboardSummary;
  selectedFilter: DashboardFilter;
  onSelectFilter: (filter: DashboardFilter) => void;
  isLoading?: boolean;
};

const FILTER_ORDER: DashboardFilter[] = [
  "ATRASADOS",
  "SEM_AGENDAMENTO",
  "PROXIMOS_DESCARTES",
];

function getCounter(summary: DashboardSummary | undefined, filter: DashboardFilter): number {
  if (!summary) {
    return 0;
  }

  if (filter === "ATRASADOS") {
    return summary.atrasados;
  }

  if (filter === "SEM_AGENDAMENTO") {
    return summary.semAgendamento;
  }

  return summary.proximosDescartes;
}

export function StatusIndicators({
  summary,
  selectedFilter,
  onSelectFilter,
  isLoading = false,
}: StatusIndicatorsProps) {
  return (
    <View style={styles.container}>
      {FILTER_ORDER.map((filter) => {
        const isSelected = filter === selectedFilter;
        const count = getCounter(summary, filter);
        const label = getFilterLabel(filter);

        return (
          <Pressable
            key={filter}
            accessibilityLabel={`${label}: ${count}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectFilter(filter)}
            style={[styles.card, isSelected ? styles.cardSelected : null]}
            testID={`indicator-${filter}`}
          >
            <Text style={[styles.cardCount, isSelected ? styles.cardCountSelected : null]}>
              {isLoading ? "--" : count}
            </Text>
            <Text style={[styles.cardLabel, isSelected ? styles.cardLabelSelected : null]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    minHeight: 84,
    padding: 10,
  },
  cardSelected: {
    backgroundColor: "#e0f2fe",
    borderColor: "#0284c7",
  },
  cardCount: {
    color: "#0f172a",
    fontSize: 24,
    fontWeight: "700",
  },
  cardCountSelected: {
    color: "#0c4a6e",
  },
  cardLabel: {
    color: "#334155",
    fontSize: 12,
    marginTop: 6,
  },
  cardLabelSelected: {
    color: "#0c4a6e",
    fontWeight: "600",
  },
});
