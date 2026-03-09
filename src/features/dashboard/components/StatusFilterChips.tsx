import React from "react";
import { FlatList, Pressable, StyleSheet, Text } from "react-native";

const ORDER_STATUSES = [
  "ABERTA",
  "EM_MANUTENCAO",
  "FINALIZADA",
  "AGUARDANDO_AGENDAMENTO",
  "AGENDADA_PRESENCIAL",
  "AGENDADA_DELIVERY",
  "ENTREGUE",
] as const;

type StatusFilterChipsProps = {
  selectedStatuses: Set<string>;
  onToggleStatus: (status: string) => void;
};

export function StatusFilterChips({ selectedStatuses, onToggleStatus }: StatusFilterChipsProps) {
  const allSelected = selectedStatuses.size === 0;

  const items: string[] = ["", ...ORDER_STATUSES];

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={items}
      horizontal
      keyExtractor={(item) => item || "__all__"}
      renderItem={({ item }) => {
        const isAll = item === "";
        const isSelected = isAll ? allSelected : selectedStatuses.has(item);
        return (
          <Pressable
            onPress={() => onToggleStatus(item)}
            style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
            testID={`status-chip-${isAll ? "Todos" : item}`}
          >
            <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : styles.chipTextUnselected]}>
              {isAll ? "Todos" : item}
            </Text>
          </Pressable>
        );
      }}
      showsHorizontalScrollIndicator={false}
      testID="status-filter-chips"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 8,
  },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipSelected: {
    backgroundColor: "#0284c7",
  },
  chipUnselected: {
    backgroundColor: "#f1f5f9",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  chipTextUnselected: {
    color: "#334155",
  },
});
