import axios from "axios";

import { http } from "../../shared/api/http";
import {
  UpdateScheduleRequest,
  UpdateScheduleResponse,
} from "./types";

export async function updateOrderSchedule(
  orderId: string,
  payload: UpdateScheduleRequest,
): Promise<UpdateScheduleResponse> {
  const response = await http.patch<UpdateScheduleResponse>(
    `/admin/orders/${orderId}/schedule`,
    payload,
  );
  return response.data;
}

export function getScheduleErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    if (
      error instanceof TypeError &&
      (error.message.includes("Network") || error.message.includes("network"))
    ) {
      return "Sem conexao. Verifique sua internet e tente novamente.";
    }

    return "Nao foi possivel salvar o agendamento. Tente novamente.";
  }

  if (!error.response) {
    return "Sem conexao. Verifique sua internet e tente novamente.";
  }

  const status = error.response.status;

  if (status === 400) {
    return "Dados de agendamento invalidos. Verifique os campos e tente novamente.";
  }

  if (status === 403) {
    return "Seu perfil nao tem permissao para editar agendamentos.";
  }

  if (status === 404) {
    return "OS nao encontrada. Atualize o dashboard e tente novamente.";
  }

  if (status >= 500) {
    return "Servico indisponivel no momento. Tente novamente em instantes.";
  }

  return "Nao foi possivel salvar o agendamento. Tente novamente.";
}
