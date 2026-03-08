import { getApproveDeliveryErrorMessage } from "./api";

function makeAxiosError(status: number) {
  const error = Object.assign(new Error("Request failed"), {
    isAxiosError: true,
    response: { status },
    config: {},
  });
  return error;
}

function makeNetworkError() {
  const error = Object.assign(new Error("Request failed"), {
    isAxiosError: true,
    response: undefined,
    config: {},
  });
  return error;
}

function makeTypeErrorNetwork() {
  return new TypeError("Network Error");
}

describe("getApproveDeliveryErrorMessage", () => {
  it("returns permission message for 403", () => {
    expect(getApproveDeliveryErrorMessage(makeAxiosError(403))).toBe(
      "Seu perfil nao tem permissao para aprovar pedidos de delivery.",
    );
  });

  it("returns not found message for 404", () => {
    expect(getApproveDeliveryErrorMessage(makeAxiosError(404))).toBe(
      "OS nao encontrada. Atualize o dashboard e tente novamente.",
    );
  });

  it("returns conflict message for 409", () => {
    expect(getApproveDeliveryErrorMessage(makeAxiosError(409))).toBe(
      "Esta OS ja foi aprovada ou nao esta mais aguardando aprovacao.",
    );
  });

  it("returns service unavailable message for 500", () => {
    expect(getApproveDeliveryErrorMessage(makeAxiosError(500))).toBe(
      "Servico indisponivel no momento. Tente novamente em instantes.",
    );
  });

  it("returns no connection message for network error (no response)", () => {
    expect(getApproveDeliveryErrorMessage(makeNetworkError())).toBe(
      "Sem conexao. Verifique sua internet e tente novamente.",
    );
  });

  it("returns no connection message for TypeError network error", () => {
    expect(getApproveDeliveryErrorMessage(makeTypeErrorNetwork())).toBe(
      "Sem conexao. Verifique sua internet e tente novamente.",
    );
  });
});
