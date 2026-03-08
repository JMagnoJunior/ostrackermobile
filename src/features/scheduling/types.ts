export type ScheduledShift = "MANHA" | "TARDE" | "NOITE";

export const SCHEDULED_SHIFTS: ScheduledShift[] = ["MANHA", "TARDE", "NOITE"];

export type UpdateScheduleRequest = {
  scheduledDate: string;
  scheduledShift: ScheduledShift;
};

export type UpdateScheduleResponse = {
  id: string;
  scheduledDate: string;
  scheduledShift: ScheduledShift;
  status: string;
};

export type EditScheduleFormValues = {
  scheduledDate: string;
  scheduledShift: ScheduledShift | "";
};

export type EditScheduleFieldErrors = {
  scheduledDate?: string;
  scheduledShift?: string;
};
