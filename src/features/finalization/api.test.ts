import { AxiosError } from "axios";

import { getSubmitErrorMessage } from "./api";

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

describe("getSubmitErrorMessage", () => {
  it("returns validation message for 400", () => {
    expect(getSubmitErrorMessage(buildAxiosError(400))).toContain("Dados invalidos");
  });

  it("returns server message for 5xx", () => {
    expect(getSubmitErrorMessage(buildAxiosError(503))).toContain("Servico indisponivel");
  });

  it("returns session message for 401 and 403", () => {
    expect(getSubmitErrorMessage(buildAxiosError(401))).toContain("Sua sessao expirou");
    expect(getSubmitErrorMessage(buildAxiosError(403))).toContain("Sua sessao expirou");
  });

  it("returns network message when no response", () => {
    expect(getSubmitErrorMessage(buildAxiosError())).toContain("Falha de conexao");
  });

  it("returns fallback for non-axios errors", () => {
    expect(getSubmitErrorMessage(new Error("boom"))).toContain("Erro inesperado");
  });
});
