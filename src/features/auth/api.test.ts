import { AxiosError } from "axios";

import { getLoginErrorMessage } from "./api";

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

describe("getLoginErrorMessage", () => {
  it("returns Google validation message for 401", () => {
    expect(getLoginErrorMessage(buildAxiosError(401))).toContain(
      "Nao foi possivel validar sua conta Google",
    );
  });

  it("returns unavailable message for 5xx", () => {
    expect(getLoginErrorMessage(buildAxiosError(500))).toContain("Servico indisponivel");
  });

  it("returns unavailable message for network failures", () => {
    expect(getLoginErrorMessage(buildAxiosError())).toContain("Servico indisponivel");
  });

  it("returns fallback for non-axios errors", () => {
    expect(getLoginErrorMessage(new Error("boom"))).toContain(
      "Nao foi possivel concluir o login",
    );
  });
});
