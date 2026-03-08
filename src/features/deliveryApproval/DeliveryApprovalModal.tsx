import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { approveDelivery, getApproveDeliveryErrorMessage } from "./api";
import { ApproveDeliveryRequest, DeliveryApprovalModalPhase } from "./types";

type DeliveryApprovalModalProps = {
  visible: boolean;
  orderId: string;
  orderLabel: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function DeliveryApprovalModal({
  visible,
  orderId,
  orderLabel,
  onClose,
  onSuccess,
}: DeliveryApprovalModalProps) {
  const [phase, setPhase] = useState<DeliveryApprovalModalPhase>("idle");
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = phase === "submitting";

  useEffect(() => {
    if (visible) {
      setPhase("idle");
      setNotes("");
      setNotesError(null);
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

  const handleConfirm = useCallback(async () => {
    if (notes.length > 300) {
      setNotesError("Maximo de 300 caracteres.");
      return;
    }
    setNotesError(null);
    setSubmitError(null);
    setPhase("submitting");

    const payload: ApproveDeliveryRequest = {};
    if (notes.trim().length > 0) {
      payload.notes = notes.trim();
    }

    try {
      await approveDelivery(orderId, payload);
      onSuccess();
    } catch (error) {
      setSubmitError(getApproveDeliveryErrorMessage(error));
      setPhase("error");
    }
  }, [notes, orderId, onSuccess]);

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
          <Text style={styles.title}>Aprovar Pedido Delivery</Text>
          <Text style={styles.subtitle}>{orderLabel}</Text>

          <Text style={styles.infoText}>
            Ao confirmar, voce declara que o pagamento Pix foi verificado e autoriza o acionamento do processo de envio via Uber.
          </Text>

          <Text style={styles.label}>Observacoes (opcional)</Text>
          <TextInput
            editable={!isSubmitting}
            maxLength={300}
            multiline
            numberOfLines={3}
            onChangeText={(text) => {
              setNotes(text);
              setNotesError(null);
            }}
            placeholder="Ex.: Pix confirmado as 14h30. Endereco verificado."
            style={[styles.input, notesError ? styles.inputError : null]}
            testID="input-notes"
            value={notes}
          />
          <Text
            style={[styles.charCounter, notes.length >= 280 && styles.charCounterWarning]}
            testID="char-counter"
          >
            {notes.length}/300
          </Text>
          {notesError ? (
            <Text style={styles.fieldError} testID="error-notes">
              {notesError}
            </Text>
          ) : null}

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
                void handleConfirm();
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
                <Text style={styles.confirmButtonText}>Confirmar Aprovacao</Text>
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
  infoText: {
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    color: "#166534",
    fontSize: 13,
    marginBottom: 16,
    padding: 10,
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
  confirmButton: {
    backgroundColor: "#15803d",
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
