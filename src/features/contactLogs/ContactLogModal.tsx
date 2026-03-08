import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { createContactLog, getContactLogErrorMessage, getContactLogs } from "./api";
import { ContactLog, ContactLogModalPhase } from "./types";

type ContactLogModalProps = {
  visible: boolean;
  orderId: string;
  orderLabel: string;
  onClose: () => void;
};

function formatCreatedAt(value: string): string {
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

function validateNote(note: string): string | null {
  if (note.length === 0) {
    return "Observacao e obrigatoria.";
  }
  if (note.trim().length === 0) {
    return "Observacao nao pode ser em branco.";
  }
  if (note.length > 500) {
    return "Maximo de 500 caracteres.";
  }
  return null;
}

export function ContactLogModal({
  visible,
  orderId,
  orderLabel,
  onClose,
}: ContactLogModalProps) {
  const [phase, setPhase] = useState<ContactLogModalPhase>("loading_history");
  const [logs, setLogs] = useState<ContactLog[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSubmitting = phase === "submitting";

  const loadHistory = useCallback(async () => {
    setPhase("loading_history");
    setHistoryError(null);
    try {
      const result = await getContactLogs(orderId);
      setLogs(result);
      setPhase("idle");
    } catch (error) {
      setHistoryError(getContactLogErrorMessage(error, "list"));
      setPhase("history_error");
    }
  }, [orderId]);

  useEffect(() => {
    if (visible) {
      setNote("");
      setNoteError(null);
      setSubmitError(null);
      setShowSuccess(false);
      setLogs([]);
      void loadHistory();
    } else {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
    }
  }, [visible, loadHistory]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isSubmitting) {
        return true;
      }
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, isSubmitting, onClose]);

  const handleSave = useCallback(async () => {
    const error = validateNote(note);
    if (error) {
      setNoteError(error);
      return;
    }
    setNoteError(null);
    setSubmitError(null);
    setPhase("submitting");

    try {
      await createContactLog(orderId, { note });
      setNote("");
      setShowSuccess(true);
      successTimerRef.current = setTimeout(() => {
        setShowSuccess(false);
        successTimerRef.current = null;
        void loadHistory();
      }, 2000);
      setPhase("idle");
    } catch (err) {
      setSubmitError(getContactLogErrorMessage(err, "create"));
      setPhase("submit_error");
    }
  }, [note, orderId, loadHistory]);

  const handleBackdropPress = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const isNoteValid = note.trim().length > 0 && note.length <= 500;
  const canSave = isNoteValid && !isSubmitting;

  return (
    <Modal
      animationType="fade"
      onRequestClose={isSubmitting ? undefined : onClose}
      transparent
      visible={visible}
    >
      <Pressable onPress={handleBackdropPress} style={styles.backdrop} testID="modal-backdrop">
        <Pressable onPress={() => {}} style={styles.card}>
          <Text style={styles.title}>Historico de Contatos</Text>
          <Text style={styles.subtitle}>{orderLabel}</Text>

          {/* Timeline area */}
          <View style={styles.timelineContainer}>
            {phase === "loading_history" ? (
              <ActivityIndicator
                color="#0f766e"
                size="small"
                testID="history-loading-indicator"
              />
            ) : phase === "history_error" ? (
              <View testID="history-error-container">
                <Text style={styles.historyErrorText}>{historyError}</Text>
                <Pressable
                  onPress={() => {
                    void loadHistory();
                  }}
                  style={styles.retryButton}
                  testID="btn-retry-history"
                >
                  <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </Pressable>
              </View>
            ) : logs.length === 0 ? (
              <Text style={styles.emptyText} testID="history-empty">
                Nenhum contato registrado ainda.
              </Text>
            ) : (
              <ScrollView
                style={styles.logsList}
                testID="history-log-list"
              >
                {logs.map((log) => (
                  <View key={log.id} style={styles.logEntry}>
                    <Text style={styles.logMeta}>
                      {log.author} · {formatCreatedAt(log.createdAt)}
                    </Text>
                    <Text style={styles.logNote}>{log.note}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.separator} />

          {/* Form area */}
          <Text style={styles.label}>Nova observacao</Text>
          <TextInput
            editable={!isSubmitting}
            maxLength={500}
            multiline
            numberOfLines={3}
            onChangeText={(text) => {
              setNote(text);
              setNoteError(null);
            }}
            placeholder="Descreva o contato realizado..."
            style={[styles.input, noteError ? styles.inputError : null]}
            testID="input-note"
            value={note}
          />
          <Text
            style={[styles.charCounter, note.length >= 480 && styles.charCounterWarning]}
            testID="char-counter"
          >
            {note.length}/500
          </Text>
          {noteError ? (
            <Text style={styles.fieldError} testID="error-note">
              {noteError}
            </Text>
          ) : null}

          {submitError ? (
            <View style={styles.errorBanner} testID="submit-error-banner">
              <Text style={styles.errorBannerText}>{submitError}</Text>
            </View>
          ) : null}

          {showSuccess ? (
            <View style={styles.successBanner} testID="success-banner">
              <Text style={styles.successBannerText}>Contato registrado com sucesso.</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              disabled={isSubmitting}
              onPress={onClose}
              style={[styles.button, styles.cancelButton]}
              testID="btn-close"
            >
              <Text style={styles.cancelButtonText}>Fechar</Text>
            </Pressable>

            <Pressable
              disabled={!canSave}
              onPress={() => {
                void handleSave();
              }}
              style={[
                styles.button,
                styles.saveButton,
                !canSave && styles.saveButtonDisabled,
              ]}
              testID="btn-save"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" testID="save-loading-indicator" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    margin: 24,
    maxHeight: "85%",
    padding: 20,
    width: "90%",
  },
  title: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 12,
  },
  timelineContainer: {
    marginBottom: 8,
    maxHeight: 200,
    minHeight: 60,
  },
  logsList: {
    flexGrow: 0,
  },
  logEntry: {
    borderBottomColor: "#e2e8f0",
    borderBottomWidth: 1,
    marginBottom: 8,
    paddingBottom: 8,
  },
  logMeta: {
    color: "#64748b",
    fontSize: 11,
    marginBottom: 2,
  },
  logNote: {
    color: "#0f172a",
    fontSize: 13,
  },
  historyErrorText: {
    color: "#991b1b",
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
  },
  retryButton: {
    alignSelf: "center",
    borderColor: "#0f766e",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryButtonText: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
  },
  separator: {
    borderBottomColor: "#e2e8f0",
    borderBottomWidth: 1,
    marginBottom: 12,
    marginTop: 4,
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    color: "#0f172a",
    fontSize: 14,
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  charCounter: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
    textAlign: "right",
  },
  charCounterWarning: {
    color: "#ef4444",
  },
  fieldError: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    marginTop: 8,
    padding: 10,
  },
  errorBannerText: {
    color: "#991b1b",
    fontSize: 13,
  },
  successBanner: {
    backgroundColor: "#dcfce7",
    borderRadius: 8,
    marginTop: 8,
    padding: 10,
  },
  successBannerText: {
    color: "#166534",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 16,
  },
  button: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButton: {
    borderColor: "#cbd5e1",
    borderWidth: 1,
  },
  cancelButtonText: {
    color: "#334155",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#0f766e",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
