import { AxiosError } from "axios";

import { getScheduleErrorMessage } from "./api";

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

describe("getScheduleErrorMessage", () => {
  it("returns 400 message for status 400", () => {
    const msg = getScheduleErrorMessage(buildAxiosError(400));
    expect(msg).toContain("invalidos");
  });

  it("returns 403 message for status 403", () => {
    const msg = getScheduleErrorMessage(buildAxiosError(403));
    expect(msg).toContain("permissao");
  });

  it("returns 404 message for status 404", () => {
    const msg = getScheduleErrorMessage(buildAxiosError(404));
    expect(msg).toContain("nao encontrada");
  });

  it("returns service unavailable message for status 500", () => {
    const msg = getScheduleErrorMessage(buildAxiosError(500));
    expect(msg).toContain("indisponivel");
  });

  it("returns network error message when response is absent", () => {
    const msg = getScheduleErrorMessage(buildAxiosError());
    expect(msg).toContain("conexao");
  });
});
