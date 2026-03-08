export type OrderFinalizationRequest = {
  technicalSummary?: string;
  finalValue: number;
  clientName: string;
  clientPhone: string;
};

export type OrderDTO = {
  id: string;
  status: "FINALIZADA" | string;
  technicalSummary: string | null;
  finalValue: number;
  finishedAt: string;
  hashAccess: string;
  clientName: string;
  clientPhone: string;
  lastNotificationAt: string | null;
};

export type FinalizationFormValues = {
  technicalSummary: string;
  finalValue: string;
  clientName: string;
  clientPhone: string;
};

export type FinalizationFieldErrors = Partial<
  Record<keyof FinalizationFormValues, string>
>;
