import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AccessControlScreen } from "../accessControl/AccessControlScreen";
import { SecretaryDashboardScreen } from "../dashboard/SecretaryDashboardScreen";
import { FinalizationScreen } from "../finalization/FinalizationScreen";
import { SuperusuarioMenu } from "./SuperusuarioMenu";
import { SuperusuarioModule } from "./types";

type SuperusuarioHomeScreenProps = {
  onSwitchAccount: () => void;
};

export function SuperusuarioHomeScreen({
  onSwitchAccount,
}: SuperusuarioHomeScreenProps) {
  const [activeModule, setActiveModule] =
    useState<SuperusuarioModule>("TECNICO");

  function renderActiveModule() {
    if (activeModule === "SECRETARIA" || activeModule === "MONITORAMENTO") {
      return <SecretaryDashboardScreen />;
    }

    if (activeModule === "ACESSO") {
      return <AccessControlScreen />;
    }

    return <FinalizationScreen />;
  }

  return (
    <View style={styles.container}>
      <SuperusuarioMenu
        activeModule={activeModule}
        onLogout={onSwitchAccount}
        onNavigate={setActiveModule}
      />
      <View style={styles.content}>{renderActiveModule()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
