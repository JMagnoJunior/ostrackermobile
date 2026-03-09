import { getEmptyMessage, getFilterLabel } from "./state";

describe("getFilterLabel", () => {
  it("retorna label correto para AGUARDANDO_CONFERENCIA", () => {
    expect(getFilterLabel("AGUARDANDO_CONFERENCIA")).toBe("Aguard. conferência");
  });

  it("retorna label correto para AGENDADAS", () => {
    expect(getFilterLabel("AGENDADAS")).toBe("Agendadas");
  });

  it("retorna label correto para NO_SHOW", () => {
    expect(getFilterLabel("NO_SHOW")).toBe("No-show");
  });

  it("retorna label correto para filtros existentes", () => {
    expect(getFilterLabel("ATRASADOS")).toBe("Atrasados");
    expect(getFilterLabel("SEM_AGENDAMENTO")).toBe("Sem agendamento");
    expect(getFilterLabel("PROXIMOS_DESCARTES")).toBe("Proximos descartes");
  });
});

describe("getEmptyMessage", () => {
  it("retorna mensagem correta para AGUARDANDO_CONFERENCIA", () => {
    expect(getEmptyMessage("AGUARDANDO_CONFERENCIA")).toBe(
      "Nenhuma OS aguardando conferência no momento.",
    );
  });

  it("retorna mensagem correta para AGENDADAS", () => {
    expect(getEmptyMessage("AGENDADAS")).toBe("Nenhuma OS agendada no momento.");
  });

  it("retorna mensagem correta para NO_SHOW", () => {
    expect(getEmptyMessage("NO_SHOW")).toBe("Nenhum no-show identificado no momento.");
  });
});
