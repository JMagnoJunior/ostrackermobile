import axios from "axios";

import { http } from "../../shared/api/http";
import { CheckinResponse } from "./types";

export async function confirmCheckin(orderId: string): Promise<CheckinResponse> {
  const response = await http.post<CheckinResponse>(`/admin/orders/${orderId}/checkin`);
  return response.data;
}

export function getCheckinErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    if (
      error instanceof TypeError &&
      (error.message.includes("Network") || error.message.includes("network"))
    ) {
      return "Sem conexao. Verifique sua internet e tente novamente.";
    }
    return "Servico indisponivel. Tente novamente em instantes.";
  }

  if (!error.response) {
    return "Sem conexao. Verifique sua internet e tente novamente.";
  }

  const status = error.response.status;

  if (status === 403) {
    return "Seu perfil nao tem permissao para realizar o check-in.";
  }
  if (status === 404) {
    return "OS nao encontrada. Atualize o dashboard e tente novamente.";
  }
  if (status === 409) {
    return "Esta OS nao esta em um status valido para check-in. Atualize o dashboard.";
  }
  if (status >= 500) {
    return "Servico indisponivel. Tente novamente em instantes.";
  }
  return "Servico indisponivel. Tente novamente em instantes.";
}
