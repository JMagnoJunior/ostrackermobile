import axios from "axios";

import { http } from "../../shared/api/http";
import { ApproveDeliveryRequest, ApproveDeliveryResponse } from "./types";

export async function approveDelivery(
  orderId: string,
  payload: ApproveDeliveryRequest,
): Promise<ApproveDeliveryResponse> {
  const response = await http.post<ApproveDeliveryResponse>(
    `/admin/orders/${orderId}/delivery/confirm`,
    payload,
  );
  return response.data;
}

export function getApproveDeliveryErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    if (
      error instanceof TypeError &&
      (error.message.includes("Network") || error.message.includes("network"))
    ) {
      return "Sem conexao. Verifique sua internet e tente novamente.";
    }
    return "Servico indisponivel no momento. Tente novamente em instantes.";
  }

  if (!error.response) {
    return "Sem conexao. Verifique sua internet e tente novamente.";
  }

  const status = error.response.status;

  if (status === 403) {
    return "Seu perfil nao tem permissao para aprovar pedidos de delivery.";
  }
  if (status === 404) {
    return "OS nao encontrada. Atualize o dashboard e tente novamente.";
  }
  if (status === 409) {
    return "Esta OS ja foi aprovada ou nao esta mais aguardando aprovacao.";
  }
  if (status >= 500) {
    return "Servico indisponivel no momento. Tente novamente em instantes.";
  }
  return "Servico indisponivel no momento. Tente novamente em instantes.";
}
