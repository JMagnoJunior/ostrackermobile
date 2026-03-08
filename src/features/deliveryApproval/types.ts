export type ApproveDeliveryRequest = {
  notes?: string;
};

export type ApproveDeliveryResponse = {
  id: string;
  status: string;
  approvedAt: string;
};

export type DeliveryApprovalModalPhase =
  | "idle"
  | "submitting"
  | "error";
