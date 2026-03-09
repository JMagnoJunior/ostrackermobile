import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getFilterLabel } from "../state";
import { DashboardFilter } from "../types";

type FilterChipsProps = {
  selectedFilter: DashboardFilter;
  onSelectFilter: (filter: DashboardFilter) => void;
};

const FILTER_ORDER: DashboardFilter[] = [
  "ATRASADOS",
  "SEM_AGENDAMENTO",
  "PROXIMOS_DESCARTES",
  "AGUARDANDO_CONFERENCIA",
  "AGENDADAS",
  "NO_SHOW",
];

export function FilterChips({ selectedFilter, onSelectFilter }: FilterChipsProps) {
  return (
    <View style={styles.container}>
      {FILTER_ORDER.map((filter) => {
        const selected = selectedFilter === filter;

        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelectFilter(filter)}
            style={[styles.chip, selected ? styles.chipSelected : null]}
            testID={`filter-chip-${filter}`}
          >
            <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>
              {getFilterLabel(filter)}
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
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: "#0f766e",
  },
  chipText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#ffffff",
  },
});
