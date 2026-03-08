import { EditScheduleFieldErrors, EditScheduleFormValues, SCHEDULED_SHIFTS } from "./types";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validateScheduleForm(
  values: EditScheduleFormValues,
): EditScheduleFieldErrors {
  const errors: EditScheduleFieldErrors = {};

  if (!values.scheduledDate) {
    errors.scheduledDate = "Data de agendamento e obrigatoria.";
  } else if (!DATE_REGEX.test(values.scheduledDate)) {
    errors.scheduledDate = "Formato de data invalido. Use AAAA-MM-DD.";
  } else {
    const parsed = new Date(values.scheduledDate + "T00:00:00");
    if (Number.isNaN(parsed.getTime())) {
      errors.scheduledDate = "Data invalida.";
    } else {
      const today = getTodayDateString();
      if (values.scheduledDate < today) {
        errors.scheduledDate = "A data de agendamento nao pode ser no passado.";
      }
    }
  }

  if (!values.scheduledShift) {
    errors.scheduledShift = "Turno e obrigatorio.";
  } else if (!(SCHEDULED_SHIFTS as readonly string[]).includes(values.scheduledShift)) {
    errors.scheduledShift = "Turno invalido.";
  }

  return errors;
}

export function hasFormErrors(errors: EditScheduleFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
