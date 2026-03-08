import {
  FinalizationFieldErrors,
  FinalizationFormValues,
  OrderFinalizationRequest,
} from "./types";

const CLIENT_PHONE_REGEX = /^[1-9][0-9]{10,14}$/;

export function validateFinalizationForm(
  values: FinalizationFormValues,
): FinalizationFieldErrors {
  const errors: FinalizationFieldErrors = {};

  if (!values.clientName.trim()) {
    errors.clientName = "Nome do cliente e obrigatorio.";
  }

  if (!values.clientPhone.trim()) {
    errors.clientPhone = "Telefone do cliente e obrigatorio.";
  } else if (!CLIENT_PHONE_REGEX.test(values.clientPhone.trim())) {
    errors.clientPhone = "Telefone invalido. Use apenas digitos (11 a 15).";
  }

  if (!values.finalValue.trim()) {
    errors.finalValue = "Valor final e obrigatorio.";
  } else {
    const parsedValue = Number(values.finalValue.replace(",", "."));
    if (Number.isNaN(parsedValue) || parsedValue <= 0) {
      errors.finalValue = "Valor final deve ser maior que zero.";
    }
  }

  return errors;
}

export function hasValidationErrors(errors: FinalizationFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildFinalizationPayload(
  values: FinalizationFormValues,
): OrderFinalizationRequest {
  const technicalSummary = values.technicalSummary.trim();

  return {
    technicalSummary: technicalSummary || undefined,
    finalValue: Number(values.finalValue.replace(",", ".")),
    clientName: values.clientName.trim(),
    clientPhone: values.clientPhone.trim(),
  };
}
