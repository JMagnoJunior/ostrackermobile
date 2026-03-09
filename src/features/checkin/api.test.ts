import { getCheckinErrorMessage } from "./api";

function makeAxiosError(status: number | undefined) {
  return Object.assign(new Error("Axios Error"), {
    isAxiosError: true,
    response: status !== undefined ? { status } : undefined,
    config: {},
  });
}

describe("getCheckinErrorMessage", () => {
  it("returns permission message for 403", () => {
    const result = getCheckinErrorMessage(makeAxiosError(403));
    expect(result).toBe("Seu perfil nao tem permissao para realizar o check-in.");
  });

  it("returns not found message for 404", () => {
    const result = getCheckinErrorMessage(makeAxiosError(404));
    expect(result).toBe("OS nao encontrada. Atualize o dashboard e tente novamente.");
  });

  it("returns conflict message for 409", () => {
    const result = getCheckinErrorMessage(makeAxiosError(409));
    expect(result).toBe("Esta OS nao esta em um status valido para check-in. Atualize o dashboard.");
  });

  it("returns service unavailable message for 500", () => {
    const result = getCheckinErrorMessage(makeAxiosError(500));
    expect(result).toBe("Servico indisponivel. Tente novamente em instantes.");
  });

  it("returns no connection message for axios error without response", () => {
    const result = getCheckinErrorMessage(makeAxiosError(undefined));
    expect(result).toBe("Sem conexao. Verifique sua internet e tente novamente.");
  });

  it("returns no connection message for network TypeError", () => {
    const networkError = new TypeError("Network Error");
    const result = getCheckinErrorMessage(networkError);
    expect(result).toBe("Sem conexao. Verifique sua internet e tente novamente.");
  });

  it("returns service unavailable for unknown non-axios error", () => {
    const result = getCheckinErrorMessage(new Error("unexpected"));
    expect(result).toBe("Servico indisponivel. Tente novamente em instantes.");
  });
});
