import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DashboardFilter, DashboardOrderItem } from "../types";

type OrderListItemProps = {
  item: DashboardOrderItem;
  selectedFilter: DashboardFilter;
  onEditSchedule?: () => void;
  onAddContactLog?: () => void;
  onApproveDelivery?: () => void;
  onCheckin?: () => void;
};

function formatFinishedAt(value: string): string {
  if (!value) {
    return "Data indisponivel";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatScheduledInfo(date?: string, shift?: string): string {
  if (!date && !shift) return "";
  const parts: string[] = [];
  if (date) parts.push(date);
  if (shift) parts.push(shift);
  return parts.join(" — ");
}

function getDetailsLine(item: DashboardOrderItem, selectedFilter: DashboardFilter): string {
  if (selectedFilter === "ATRASADOS") {
    if (typeof item.inactiveHours === "number") {
      return `Inativa ha ${item.inactiveHours}h`;
    }

    return "Sem dado de inatividade";
  }

  if (selectedFilter === "PROXIMOS_DESCARTES") {
    if (typeof item.daysToDiscard === "number") {
      return `Descarta em ${item.daysToDiscard} dias`;
    }

    return "Sem previsao de descarte";
  }

  if (selectedFilter === "AGUARDANDO_CONFERENCIA") {
    return item.finishedAt
      ? `Finalizada em ${formatFinishedAt(item.finishedAt)}`
      : "Data de finalizacao indisponivel";
  }

  if (selectedFilter === "AGENDADAS") {
    const info = formatScheduledInfo(item.scheduledDate, item.scheduledShift);
    return info ? `Agendada: ${info}` : "Sem data de agendamento";
  }

  if (selectedFilter === "NO_SHOW") {
    const info = formatScheduledInfo(item.scheduledDate, item.scheduledShift);
    return info
      ? `No-show: turno ${item.scheduledShift ?? ""} em ${item.scheduledDate ?? ""}`.trim()
      : "Turno expirado";
  }

  return `Finalizada em ${formatFinishedAt(item.finishedAt)}`;
}

export function OrderListItem({ item, selectedFilter, onEditSchedule, onAddContactLog, onApproveDelivery, onCheckin }: OrderListItemProps) {
  const detailsLine = getDetailsLine(item, selectedFilter);

  return (
    <View
      accessibilityLabel={`${item.clientName}. Status ${item.status}. ${detailsLine}`}
      style={styles.container}
    >
      <Text style={styles.clientName}>{item.clientName}</Text>
      <Text style={styles.status}>{item.status}</Text>
      <Text style={styles.details}>{detailsLine}</Text>
      {item.clientPhone ? <Text style={styles.phone}>{item.clientPhone}</Text> : null}

      {onEditSchedule ? (
        <Pressable
          onPress={onEditSchedule}
          style={styles.editButton}
          testID="btn-edit-schedule"
        >
          <Text style={styles.editButtonText}>Editar Agendamento</Text>
        </Pressable>
      ) : null}

      {onAddContactLog ? (
        <Pressable
          onPress={onAddContactLog}
          style={styles.contactLogButton}
          testID="btn-add-contact-log"
        >
          <Text style={styles.contactLogButtonText}>Registrar Contato</Text>
        </Pressable>
      ) : null}

      {item.status === "AGENDADA_DELIVERY" && onApproveDelivery ? (
        <Pressable
          onPress={onApproveDelivery}
          style={styles.approveButton}
          testID="btn-approve-delivery"
        >
          <Text style={styles.approveButtonText}>Aprovar Delivery</Text>
        </Pressable>
      ) : null}

      {(item.status === "AGENDADA_PRESENCIAL" || item.status === "AGENDADA_DELIVERY") && onCheckin ? (
        <Pressable
          onPress={onCheckin}
          style={styles.checkinButton}
          testID="btn-checkin"
        >
          <Text style={styles.checkinButtonText}>Confirmar Entrega</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  clientName: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
  },
  status: {
    color: "#0f766e",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  details: {
    color: "#334155",
    fontSize: 13,
    marginTop: 6,
  },
  phone: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  editButton: {
    alignSelf: "flex-end",
    borderColor: "#0f766e",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "600",
  },
  contactLogButton: {
    alignSelf: "flex-end",
    borderColor: "#64748b",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  contactLogButtonText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
  },
  approveButton: {
    alignSelf: "flex-end",
    backgroundColor: "#15803d",
    borderRadius: 8,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  approveButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  checkinButton: {
    alignSelf: "flex-end",
    backgroundColor: "#1d4ed8",
    borderRadius: 8,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  checkinButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
});
