export type CheckinResponse = {
  id: string;
  status: string;
  deliveredAt: string;
};

export type CheckinModalPhase = "idle" | "submitting" | "error";
