import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { createFinalizedOrder, getSubmitErrorMessage } from "./api";
import { FinalizationFieldErrors, FinalizationFormValues, OrderDTO } from "./types";
import {
  buildFinalizationPayload,
  hasValidationErrors,
  validateFinalizationForm,
} from "./validation";

const INITIAL_VALUES: FinalizationFormValues = {
  technicalSummary: "",
  finalValue: "",
  clientName: "",
  clientPhone: "",
};

export function FinalizationScreen() {
  const [values, setValues] = useState<FinalizationFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<FinalizationFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<OrderDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isButtonDisabled = useMemo(() => isSubmitting, [isSubmitting]);

  function updateField(field: keyof FinalizationFormValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setSubmitError(null);
  }

  async function submit() {
    setSuccessOrder(null);
    const validationErrors = validateFinalizationForm(values);
    setFieldErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = buildFinalizationPayload(values);
      const order = await createFinalizedOrder(payload);
      setSuccessOrder(order);
      setValues(INITIAL_VALUES);
      setFieldErrors({});
    } catch (error) {
      setSubmitError(getSubmitErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Finalizar OS</Text>
      <Text style={styles.subtitle}>
        MVP inicial com uma unica funcionalidade: registrar ordem finalizada.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nome do cliente *</Text>
        <TextInput
          autoCapitalize="words"
          placeholder="Ex: Joao Silva"
          style={[styles.input, fieldErrors.clientName ? styles.inputError : null]}
          value={values.clientName}
          onChangeText={(text) => updateField("clientName", text)}
        />
        {fieldErrors.clientName ? (
          <Text style={styles.errorText}>{fieldErrors.clientName}</Text>
        ) : null}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Telefone do cliente *</Text>
        <TextInput
          keyboardType="number-pad"
          placeholder="Ex: 5511999999999"
          style={[styles.input, fieldErrors.clientPhone ? styles.inputError : null]}
          value={values.clientPhone}
          onChangeText={(text) => updateField("clientPhone", text)}
        />
        {fieldErrors.clientPhone ? (
          <Text style={styles.errorText}>{fieldErrors.clientPhone}</Text>
        ) : null}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Valor final *</Text>
        <TextInput
          keyboardType="decimal-pad"
          placeholder="Ex: 250.00"
          style={[styles.input, fieldErrors.finalValue ? styles.inputError : null]}
          value={values.finalValue}
          onChangeText={(text) => updateField("finalValue", text)}
        />
        {fieldErrors.finalValue ? (
          <Text style={styles.errorText}>{fieldErrors.finalValue}</Text>
        ) : null}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Resumo tecnico (opcional)</Text>
        <TextInput
          multiline
          numberOfLines={4}
          placeholder="Descreva o servico realizado"
          style={[styles.input, styles.textArea]}
          value={values.technicalSummary}
          onChangeText={(text) => updateField("technicalSummary", text)}
        />
      </View>

      {submitError ? <Text style={styles.errorBanner}>{submitError}</Text> : null}

      {successOrder ? (
        <View style={styles.successBox}>
          <Text style={styles.successTitle}>OS finalizada com sucesso.</Text>
          <Text style={styles.successLine}>ID: {successOrder.id}</Text>
          <Text style={styles.successLine}>Status: {successOrder.status}</Text>
          <Text style={styles.successLine}>Finalizada em: {successOrder.finishedAt}</Text>
        </View>
      ) : null}

      <Pressable
        disabled={isButtonDisabled}
        onPress={submit}
        style={[
          styles.submitButton,
          isButtonDisabled ? styles.submitButtonDisabled : null,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Enviar finalizacao</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    color: "#0f172a",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#334155",
    fontSize: 14,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderRadius: 10,
    borderWidth: 1,
    color: "#0f172a",
    fontSize: 16,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#b91c1c",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    color: "#991b1b",
    marginBottom: 12,
    padding: 10,
  },
  successBox: {
    backgroundColor: "#dcfce7",
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
  },
  successTitle: {
    color: "#166534",
    fontWeight: "700",
    marginBottom: 6,
  },
  successLine: {
    color: "#166534",
    fontSize: 12,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 10,
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#64748b",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
