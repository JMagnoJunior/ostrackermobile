import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MENU_ITEMS, SuperusuarioModule } from "./types";

type SuperusuarioMenuProps = {
  activeModule: SuperusuarioModule;
  onNavigate: (module: SuperusuarioModule) => void;
  onLogout: () => void;
};

export function SuperusuarioMenu({
  activeModule,
  onNavigate,
  onLogout,
}: SuperusuarioMenuProps) {
  return (
    <View style={styles.container}>
      {MENU_ITEMS.map((item) => {
        const isSelected = item.module === activeModule;
        return (
          <Pressable
            key={item.module}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={[styles.menuItem, isSelected && styles.menuItemSelected]}
            onPress={() => onNavigate(item.module)}
          >
            <Text
              style={[styles.menuLabel, isSelected && styles.menuLabelSelected]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        accessibilityRole="button"
        style={styles.logoutButton}
        onPress={onLogout}
      >
        <Text style={styles.logoutLabel}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0f766e",
    paddingVertical: 12,
    width: "100%",
  },
  logoutButton: {
    borderTopColor: "#0d9488",
    borderTopWidth: 1,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoutLabel: {
    color: "#ccfbf1",
    fontSize: 14,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemSelected: {
    backgroundColor: "#0d9488",
  },
  menuLabel: {
    color: "#e2fdf8",
    fontSize: 15,
  },
  menuLabelSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
