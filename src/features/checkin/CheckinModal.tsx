import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { confirmCheckin, getCheckinErrorMessage } from "./api";
import { CheckinModalPhase } from "./types";

type CheckinModalProps = {
  visible: boolean;
  orderId: string;
  orderLabel: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function CheckinModal({
  visible,
  orderId,
  orderLabel,
  onClose,
  onSuccess,
}: CheckinModalProps) {
  const [phase, setPhase] = useState<CheckinModalPhase>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = phase === "submitting";

  useEffect(() => {
    if (visible) {
      setPhase("idle");
      setSubmitError(null);
    }
  }, [visible]);

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

  const handleSubmit = useCallback(async () => {
    setPhase("submitting");
    setSubmitError(null);
    try {
      await confirmCheckin(orderId);
      onSuccess();
    } catch (error) {
      setPhase("error");
      setSubmitError(getCheckinErrorMessage(error));
    }
  }, [orderId, onSuccess]);

  const handleBackdropPress = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={isSubmitting ? undefined : onClose}
      transparent
      visible={visible}
    >
      <Pressable onPress={handleBackdropPress} style={styles.backdrop} testID="modal-backdrop">
        <Pressable onPress={() => {}} style={styles.card}>
          <Text style={styles.title}>Confirmar Entrega</Text>
          <Text style={styles.subtitle}>{orderLabel}</Text>

          <Text style={styles.infoText}>
            Ao confirmar, a OS sera marcada como ENTREGUE e todos os ciclos de reenvio serao encerrados. Esta acao nao pode ser desfeita.
          </Text>

          {submitError ? (
            <View style={styles.errorBanner} testID="submit-error-banner">
              <Text style={styles.errorBannerText}>{submitError}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              disabled={isSubmitting}
              onPress={onClose}
              style={[styles.button, styles.cancelButton]}
              testID="btn-cancel"
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>

            <Pressable
              disabled={isSubmitting}
              onPress={() => {
                void handleSubmit();
              }}
              style={[
                styles.button,
                styles.confirmButton,
                isSubmitting && styles.confirmButtonDisabled,
              ]}
              testID="btn-confirm"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" testID="confirm-loading-indicator" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirmar Entrega</Text>
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
  infoText: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    color: "#1e40af",
    fontSize: 13,
    marginBottom: 16,
    padding: 10,
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
  },
  errorBannerText: {
    color: "#991b1b",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 4,
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
  confirmButton: {
    backgroundColor: "#1d4ed8",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
