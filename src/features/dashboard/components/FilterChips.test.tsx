import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { FilterChips } from "./FilterChips";

describe("FilterChips", () => {
  it("renderiza chips para todos os seis filtros", () => {
    const screen = render(
      <FilterChips onSelectFilter={jest.fn()} selectedFilter="ATRASADOS" />,
    );

    expect(screen.getByTestId("filter-chip-ATRASADOS")).toBeTruthy();
    expect(screen.getByTestId("filter-chip-SEM_AGENDAMENTO")).toBeTruthy();
    expect(screen.getByTestId("filter-chip-PROXIMOS_DESCARTES")).toBeTruthy();
    expect(screen.getByTestId("filter-chip-AGUARDANDO_CONFERENCIA")).toBeTruthy();
    expect(screen.getByTestId("filter-chip-AGENDADAS")).toBeTruthy();
    expect(screen.getByTestId("filter-chip-NO_SHOW")).toBeTruthy();
  });

  it("onSelectFilter chamado com AGUARDANDO_CONFERENCIA ao pressionar chip", () => {
    const onSelectFilter = jest.fn();

    const screen = render(
      <FilterChips onSelectFilter={onSelectFilter} selectedFilter="ATRASADOS" />,
    );

    fireEvent.press(screen.getByTestId("filter-chip-AGUARDANDO_CONFERENCIA"));

    expect(onSelectFilter).toHaveBeenCalledWith("AGUARDANDO_CONFERENCIA");
  });

  it("onSelectFilter chamado com AGENDADAS ao pressionar chip", () => {
    const onSelectFilter = jest.fn();

    const screen = render(
      <FilterChips onSelectFilter={onSelectFilter} selectedFilter="ATRASADOS" />,
    );

    fireEvent.press(screen.getByTestId("filter-chip-AGENDADAS"));

    expect(onSelectFilter).toHaveBeenCalledWith("AGENDADAS");
  });

  it("onSelectFilter chamado com NO_SHOW ao pressionar chip", () => {
    const onSelectFilter = jest.fn();

    const screen = render(
      <FilterChips onSelectFilter={onSelectFilter} selectedFilter="ATRASADOS" />,
    );

    fireEvent.press(screen.getByTestId("filter-chip-NO_SHOW"));

    expect(onSelectFilter).toHaveBeenCalledWith("NO_SHOW");
  });

  it("chip selecionado reflete selectedFilter corretamente", () => {
    const screen = render(
      <FilterChips onSelectFilter={jest.fn()} selectedFilter="AGENDADAS" />,
    );

    const selectedChip = screen.getByTestId("filter-chip-AGENDADAS");
    expect(selectedChip).toBeTruthy();
  });
});
