import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { StatusIndicators } from "./StatusIndicators";

describe("StatusIndicators", () => {
  it("calls onSelectFilter when user taps an indicator", () => {
    const onSelectFilter = jest.fn();

    const screen = render(
      <StatusIndicators
        onSelectFilter={onSelectFilter}
        selectedFilter="ATRASADOS"
        summary={{
          atrasados: 4,
          semAgendamento: 2,
          proximosDescartes: 1,
          generatedAt: "2026-03-08T12:00:00Z",
        }}
      />,
    );

    fireEvent.press(screen.getByTestId("indicator-SEM_AGENDAMENTO"));

    expect(onSelectFilter).toHaveBeenCalledWith("SEM_AGENDAMENTO");
  });
});
