import axios from "axios";

import { http } from "../../shared/api/http";
import { OrderDTO, OrderFinalizationRequest } from "./types";

export async function createFinalizedOrder(
  payload: OrderFinalizationRequest,
): Promise<OrderDTO> {
  const response = await http.post<OrderDTO>("/api/orders/finalizations", payload);
  return response.data;
}

export function getSubmitErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Erro inesperado. Tente novamente.";
  }

  if (!error.response) {
    return "Falha de conexao. Verifique a internet e tente novamente.";
  }

  if (error.response.status === 400) {
    return "Dados invalidos. Revise os campos e tente novamente.";
  }

  if (error.response.status === 401 || error.response.status === 403) {
    return "Sua sessao expirou ou nao possui acesso. Entre novamente.";
  }

  if (error.response.status >= 500) {
    return "Servico indisponivel no momento. Tente novamente em instantes.";
  }

  return "Nao foi possivel concluir a operacao. Tente novamente.";
}
