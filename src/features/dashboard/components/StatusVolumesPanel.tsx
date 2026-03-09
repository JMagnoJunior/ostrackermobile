import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MonitoringStatusVolume } from "../types";

type StatusVolumesPanelProps = {
  volumes: MonitoringStatusVolume[];
  isLoading?: boolean;
};

export function StatusVolumesPanel({ volumes, isLoading = false }: StatusVolumesPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const visible = volumes.filter((v) => v.count > 0);

  if (!isLoading && visible.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} testID="status-volumes-panel">
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.header}
        testID="status-volumes-toggle"
      >
        <Text style={styles.headerText}>
          Volumes por status {expanded ? "▴" : "▾"}
        </Text>
      </Pressable>

      {expanded ? (
        <View style={styles.grid} testID="status-volumes-grid">
          {(isLoading ? volumes : visible).map((item) => (
            <View key={item.status} style={styles.chip} testID={`volume-chip-${item.status}`}>
              <Text style={styles.chipText}>
                {item.status}: {isLoading ? "--" : item.count}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    paddingVertical: 8,
  },
  headerText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    color: "#334155",
    fontSize: 12,
  },
});
