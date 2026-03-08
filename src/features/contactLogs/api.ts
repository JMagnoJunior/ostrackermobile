import axios from "axios";

import { http } from "../../shared/api/http";
import {
  ContactLogListResponse,
  CreateContactLogRequest,
  CreateContactLogResponse,
} from "./types";

export async function getContactLogs(orderId: string): Promise<ContactLogListResponse> {
  const response = await http.get<ContactLogListResponse>(
    `/admin/orders/${orderId}/contact-logs`,
  );
  return response.data;
}

export async function createContactLog(
  orderId: string,
  payload: CreateContactLogRequest,
): Promise<CreateContactLogResponse> {
  const response = await http.post<CreateContactLogResponse>(
    `/admin/orders/${orderId}/contact-logs`,
    payload,
  );
  return response.data;
}

export function getContactLogErrorMessage(
  error: unknown,
  context: "list" | "create",
): string {
  if (!axios.isAxiosError(error)) {
    if (
      error instanceof TypeError &&
      (error.message.includes("Network") || error.message.includes("network"))
    ) {
      return "Sem conexao. Verifique sua internet e tente novamente.";
    }

    return context === "list"
      ? "Nao foi possivel carregar o historico. Tente novamente."
      : "Nao foi possivel registrar o contato. Tente novamente.";
  }

  if (!error.response) {
    return "Sem conexao. Verifique sua internet e tente novamente.";
  }

  const status = error.response.status;

  if (context === "list") {
    if (status === 403) {
      return "Sem permissao para visualizar o historico desta OS.";
    }
    if (status === 404) {
      return "OS nao encontrada. Atualize o dashboard e tente novamente.";
    }
    if (status >= 500) {
      return "Servico indisponivel no momento. Tente novamente em instantes.";
    }
    return "Nao foi possivel carregar o historico. Tente novamente.";
  }

  // context === "create"
  if (status === 400) {
    return "Conteudo invalido. Verifique o texto e tente novamente.";
  }
  if (status === 403) {
    return "Seu perfil nao tem permissao para registrar contatos.";
  }
  if (status === 404) {
    return "OS nao encontrada. Atualize o dashboard e tente novamente.";
  }
  if (status >= 500) {
    return "Servico indisponivel no momento. Tente novamente em instantes.";
  }
  return "Nao foi possivel registrar o contato. Tente novamente.";
}
