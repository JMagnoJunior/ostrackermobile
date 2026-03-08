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

import { getScheduleErrorMessage, updateOrderSchedule } from "./api";
import {
  EditScheduleFieldErrors,
  EditScheduleFormValues,
  SCHEDULED_SHIFTS,
  ScheduledShift,
} from "./types";
import { hasFormErrors, validateScheduleForm } from "./validation";

type EditScheduleModalProps = {
  visible: boolean;
  orderId: string;
  orderLabel: string;
  initialDate?: string;
  initialShift?: ScheduledShift;
  onSuccess: () => void;
  onClose: () => void;
};

export function EditScheduleModal({
  visible,
  orderId,
  orderLabel,
  initialDate,
  initialShift,
  onSuccess,
  onClose,
}: EditScheduleModalProps) {
  const [values, setValues] = useState<EditScheduleFormValues>({
    scheduledDate: initialDate ?? "",
    scheduledShift: initialShift ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<EditScheduleFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setValues({
        scheduledDate: initialDate ?? "",
        scheduledShift: initialShift ?? "",
      });
      setFieldErrors({});
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [visible, initialDate, initialShift]);

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
    const errors = validateScheduleForm(values);
    if (hasFormErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await updateOrderSchedule(orderId, {
        scheduledDate: values.scheduledDate,
        scheduledShift: values.scheduledShift as ScheduledShift,
      });
      onSuccess();
    } catch (error) {
      setSubmitError(getScheduleErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [orderId, values, onSuccess]);

  const handleBackdropPress = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const isFormValid =
    values.scheduledDate.trim() !== "" && values.scheduledShift !== "";

  return (
    <Modal
      animationType="fade"
      onRequestClose={isSubmitting ? undefined : onClose}
      transparent
      visible={visible}
    >
      <Pressable onPress={handleBackdropPress} style={styles.backdrop} testID="modal-backdrop">
        <Pressable onPress={() => {}} style={styles.card}>
          <Text style={styles.title}>Editar Agendamento</Text>
          <Text style={styles.subtitle}>{orderLabel}</Text>

          {submitError ? (
            <View style={styles.errorBanner} testID="submit-error-banner">
              <Text style={styles.errorBannerText}>{submitError}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Data (AAAA-MM-DD)</Text>
          <TextInput
            editable={!isSubmitting}
            keyboardType="numeric"
            onChangeText={(text) => {
              setValues((prev) => ({ ...prev, scheduledDate: text }));
              setFieldErrors((prev) => ({ ...prev, scheduledDate: undefined }));
            }}
            placeholder="AAAA-MM-DD"
            style={[styles.input, fieldErrors.scheduledDate ? styles.inputError : null]}
            testID="input-scheduled-date"
            value={values.scheduledDate}
          />
          {fieldErrors.scheduledDate ? (
            <Text style={styles.fieldError} testID="error-scheduled-date">
              {fieldErrors.scheduledDate}
            </Text>
          ) : null}

          <Text style={[styles.label, styles.labelShift]}>Turno</Text>
          <View style={styles.shiftRow} testID="shift-chips">
            {SCHEDULED_SHIFTS.map((shift) => {
              const isActive = values.scheduledShift === shift;
              return (
                <Pressable
                  disabled={isSubmitting}
                  key={shift}
                  onPress={() => {
                    setValues((prev) => ({ ...prev, scheduledShift: shift }));
                    setFieldErrors((prev) => ({ ...prev, scheduledShift: undefined }));
                  }}
                  style={[styles.shiftChip, isActive && styles.shiftChipActive]}
                  testID={`shift-chip-${shift}`}
                >
                  <Text style={[styles.shiftChipText, isActive && styles.shiftChipTextActive]}>
                    {shift}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {fieldErrors.scheduledShift ? (
            <Text style={styles.fieldError} testID="error-scheduled-shift">
              {fieldErrors.scheduledShift}
            </Text>
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
              disabled={isSubmitting || !isFormValid}
              onPress={() => {
                void handleSave();
              }}
              style={[
                styles.button,
                styles.saveButton,
                (isSubmitting || !isFormValid) && styles.saveButtonDisabled,
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
    marginBottom: 16,
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
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  labelShift: {
    marginTop: 14,
  },
  input: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    color: "#0f172a",
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  fieldError: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  shiftRow: {
    flexDirection: "row",
    gap: 8,
  },
  shiftChip: {
    borderColor: "#94a3b8",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  shiftChipActive: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e",
  },
  shiftChipText: {
    color: "#334155",
    fontSize: 13,
  },
  shiftChipTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 20,
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
