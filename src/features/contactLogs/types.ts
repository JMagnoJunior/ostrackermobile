export type ContactLog = {
  id: string;
  orderId: string;
  note: string;
  author: string;
  createdAt: string;
};

export type ContactLogListResponse = ContactLog[];

export type CreateContactLogRequest = {
  note: string;
};

export type CreateContactLogResponse = ContactLog;

export type ContactLogFormValues = {
  note: string;
};

export type ContactLogModalPhase =
  | "loading_history"
  | "history_error"
  | "idle"
  | "submitting"
  | "submit_error";
