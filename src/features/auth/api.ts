import axios from "axios";

import { http } from "../../shared/api/http";
import { AuthSession, AuthSessionResponse, normalizeAuthSession } from "./session";

export type GoogleLoginRequest = {
  idToken: string;
};

export async function loginWithGoogle(idToken: string): Promise<AuthSession> {
  const payload: GoogleLoginRequest = { idToken };
  const response = await http.post<AuthSessionResponse>("/api/auth/google", payload);
  return normalizeAuthSession(response.data);
}

export function getLoginErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Nao foi possivel concluir o login. Tente novamente.";
  }

  if (!error.response) {
    return "Servico indisponivel no momento. Tente novamente em instantes.";
  }

  if (error.response.status === 401) {
    return "Nao foi possivel validar sua conta Google. Tente novamente.";
  }

  if (error.response.status >= 500) {
    return "Servico indisponivel no momento. Tente novamente em instantes.";
  }

  return "Nao foi possivel concluir o login. Tente novamente.";
}
