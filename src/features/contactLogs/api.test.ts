import { AxiosError } from "axios";

import { getContactLogErrorMessage } from "./api";

function buildAxiosError(status?: number): AxiosError {
  return new AxiosError(
    "request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    status
      ? ({
          status,
          statusText: "error",
          headers: {},
          config: { headers: {} },
          data: {},
        } as any)
      : undefined,
  );
}

function buildNetworkError(): AxiosError {
  const error = new AxiosError("Network Error", "ERR_NETWORK");
  // no response
  return error;
}

describe("getContactLogErrorMessage — context: list", () => {
  it("returns permission message for 403", () => {
    expect(getContactLogErrorMessage(buildAxiosError(403), "list")).toBe(
      "Sem permissao para visualizar o historico desta OS.",
    );
  });

  it("returns not-found message for 404", () => {
    expect(getContactLogErrorMessage(buildAxiosError(404), "list")).toBe(
      "OS nao encontrada. Atualize o dashboard e tente novamente.",
    );
  });

  it("returns service unavailable for 500", () => {
    expect(getContactLogErrorMessage(buildAxiosError(500), "list")).toBe(
      "Servico indisponivel no momento. Tente novamente em instantes.",
    );
  });

  it("returns service unavailable for 503", () => {
    expect(getContactLogErrorMessage(buildAxiosError(503), "list")).toBe(
      "Servico indisponivel no momento. Tente novamente em instantes.",
    );
  });

  it("returns no-connection message for network error (axios, no response)", () => {
    expect(getContactLogErrorMessage(buildNetworkError(), "list")).toBe(
      "Sem conexao. Verifique sua internet e tente novamente.",
    );
  });

  it("returns no-connection message for TypeError with 'Network' in message", () => {
    const error = new TypeError("Network request failed");
    expect(getContactLogErrorMessage(error, "list")).toBe(
      "Sem conexao. Verifique sua internet e tente novamente.",
    );
  });

  it("returns generic fallback for unknown non-axios error", () => {
    expect(getContactLogErrorMessage(new Error("boom"), "list")).toBe(
      "Nao foi possivel carregar o historico. Tente novamente.",
    );
  });
});

describe("getContactLogErrorMessage — context: create", () => {
  it("returns invalid-content message for 400", () => {
    expect(getContactLogErrorMessage(buildAxiosError(400), "create")).toBe(
      "Conteudo invalido. Verifique o texto e tente novamente.",
    );
  });

  it("returns permission message for 403", () => {
    expect(getContactLogErrorMessage(buildAxiosError(403), "create")).toBe(
      "Seu perfil nao tem permissao para registrar contatos.",
    );
  });

  it("returns not-found message for 404", () => {
    expect(getContactLogErrorMessage(buildAxiosError(404), "create")).toBe(
      "OS nao encontrada. Atualize o dashboard e tente novamente.",
    );
  });

  it("returns service unavailable for 500", () => {
    expect(getContactLogErrorMessage(buildAxiosError(500), "create")).toBe(
      "Servico indisponivel no momento. Tente novamente em instantes.",
    );
  });

  it("returns service unavailable for 502", () => {
    expect(getContactLogErrorMessage(buildAxiosError(502), "create")).toBe(
      "Servico indisponivel no momento. Tente novamente em instantes.",
    );
  });

  it("returns no-connection message for network error (axios, no response)", () => {
    expect(getContactLogErrorMessage(buildNetworkError(), "create")).toBe(
      "Sem conexao. Verifique sua internet e tente novamente.",
    );
  });

  it("returns generic fallback for unknown non-axios error", () => {
    expect(getContactLogErrorMessage(new Error("boom"), "create")).toBe(
      "Nao foi possivel registrar o contato. Tente novamente.",
    );
  });
});
