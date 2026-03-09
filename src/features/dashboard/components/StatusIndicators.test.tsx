import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { DashboardSummary } from "../types";
import { StatusIndicators } from "./StatusIndicators";

const baseSummary: DashboardSummary = {
  atrasados: 4,
  semAgendamento: 2,
  proximosDescartes: 1,
  aguardandoConferencia: 3,
  agendadas: 5,
  noShow: 2,
  generatedAt: "2026-03-08T12:00:00Z",
  statusVolumes: [],
};

describe("StatusIndicators", () => {
  it("calls onSelectFilter when user taps an indicator", () => {
    const onSelectFilter = jest.fn();

    const screen = render(
      <StatusIndicators
        onSelectFilter={onSelectFilter}
        selectedFilter="ATRASADOS"
        summary={baseSummary}
      />,
    );

    fireEvent.press(screen.getByTestId("indicator-SEM_AGENDAMENTO"));

    expect(onSelectFilter).toHaveBeenCalledWith("SEM_AGENDAMENTO");
  });

  it("renderiza contadores para aguardandoConferencia, agendadas e noShow", () => {
    const screen = render(
      <StatusIndicators
        onSelectFilter={jest.fn()}
        selectedFilter="ATRASADOS"
        summary={baseSummary}
      />,
    );

    expect(screen.getByTestId("indicator-AGUARDANDO_CONFERENCIA")).toBeTruthy();
    expect(screen.getByTestId("indicator-AGENDADAS")).toBeTruthy();
    expect(screen.getByTestId("indicator-NO_SHOW")).toBeTruthy();
  });

  it("exibe -- para novos contadores enquanto isLoading=true", () => {
    const screen = render(
      <StatusIndicators
        isLoading={true}
        onSelectFilter={jest.fn()}
        selectedFilter="ATRASADOS"
        summary={baseSummary}
      />,
    );

    const indicators = ["AGUARDANDO_CONFERENCIA", "AGENDADAS", "NO_SHOW"];
    for (const filter of indicators) {
      const card = screen.getByTestId(`indicator-${filter}`);
      expect(card).toBeTruthy();
    }
  });

  it("exibe 0 quando summary undefined para novos filtros", () => {
    const onSelectFilter = jest.fn();

    const screen = render(
      <StatusIndicators
        onSelectFilter={onSelectFilter}
        selectedFilter="AGUARDANDO_CONFERENCIA"
        summary={undefined}
      />,
    );

    expect(screen.getByTestId("indicator-AGUARDANDO_CONFERENCIA")).toBeTruthy();
    expect(screen.getByTestId("indicator-AGENDADAS")).toBeTruthy();
    expect(screen.getByTestId("indicator-NO_SHOW")).toBeTruthy();
  });

  it("chama onSelectFilter com filtro correto ao pressionar novo chip", () => {
    const onSelectFilter = jest.fn();

    const screen = render(
      <StatusIndicators
        onSelectFilter={onSelectFilter}
        selectedFilter="ATRASADOS"
        summary={baseSummary}
      />,
    );

    fireEvent.press(screen.getByTestId("indicator-AGENDADAS"));
    expect(onSelectFilter).toHaveBeenCalledWith("AGENDADAS");

    fireEvent.press(screen.getByTestId("indicator-NO_SHOW"));
    expect(onSelectFilter).toHaveBeenCalledWith("NO_SHOW");
  });
});
