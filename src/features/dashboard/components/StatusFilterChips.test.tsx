import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { StatusFilterChips } from "./StatusFilterChips";

describe("StatusFilterChips", () => {
  it("chip selecionado recebe estilo ativo", () => {
    const screen = render(
      <StatusFilterChips
        onToggleStatus={jest.fn()}
        selectedStatuses={new Set(["FINALIZADA"])}
      />,
    );

    const chip = screen.getByTestId("status-chip-FINALIZADA");
    expect(chip.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#0284c7" }),
      ]),
    );
  });

  it("pressionar chip chama onToggleStatus com status correto", () => {
    const onToggle = jest.fn();

    const screen = render(
      <StatusFilterChips
        onToggleStatus={onToggle}
        selectedStatuses={new Set()}
      />,
    );

    fireEvent.press(screen.getByTestId("status-chip-FINALIZADA"));

    expect(onToggle).toHaveBeenCalledWith("FINALIZADA");
  });

  it("chip Todos chama onToggleStatus com string vazia", () => {
    const onToggle = jest.fn();

    const screen = render(
      <StatusFilterChips
        onToggleStatus={onToggle}
        selectedStatuses={new Set(["FINALIZADA"])}
      />,
    );

    fireEvent.press(screen.getByTestId("status-chip-Todos"));

    expect(onToggle).toHaveBeenCalledWith("");
  });

  it("chip Todos aparece selecionado quando selectedStatuses vazio", () => {
    const screen = render(
      <StatusFilterChips
        onToggleStatus={jest.fn()}
        selectedStatuses={new Set()}
      />,
    );

    const chip = screen.getByTestId("status-chip-Todos");
    expect(chip.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#0284c7" }),
      ]),
    );
  });
});
