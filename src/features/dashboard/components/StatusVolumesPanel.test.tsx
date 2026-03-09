import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { StatusVolumesPanel } from "./StatusVolumesPanel";

describe("StatusVolumesPanel", () => {
  it("renderiza chips para cada volume com count > 0", () => {
    const volumes = [
      { status: "FINALIZADA", count: 5 },
      { status: "AGUARDANDO_AGENDAMENTO", count: 2 },
    ];

    const screen = render(<StatusVolumesPanel volumes={volumes} />);

    expect(screen.getByTestId("volume-chip-FINALIZADA")).toBeTruthy();
    expect(screen.getByTestId("volume-chip-AGUARDANDO_AGENDAMENTO")).toBeTruthy();
    expect(screen.getByText("FINALIZADA: 5")).toBeTruthy();
    expect(screen.getByText("AGUARDANDO_AGENDAMENTO: 2")).toBeTruthy();
  });

  it("nao renderiza quando volumes e array vazio", () => {
    const screen = render(<StatusVolumesPanel volumes={[]} />);

    expect(screen.queryByTestId("status-volumes-panel")).toBeNull();
  });

  it("exibe -- em todos os chips quando isLoading=true", () => {
    const volumes = [
      { status: "FINALIZADA", count: 3 },
      { status: "ABERTA", count: 1 },
    ];

    const screen = render(<StatusVolumesPanel volumes={volumes} isLoading />);

    expect(screen.getByText("FINALIZADA: --")).toBeTruthy();
    expect(screen.getByText("ABERTA: --")).toBeTruthy();
  });

  it("toggle colapsa e expande o painel", () => {
    const volumes = [{ status: "FINALIZADA", count: 1 }];

    const screen = render(<StatusVolumesPanel volumes={volumes} />);

    expect(screen.getByTestId("status-volumes-grid")).toBeTruthy();

    fireEvent.press(screen.getByTestId("status-volumes-toggle"));

    expect(screen.queryByTestId("status-volumes-grid")).toBeNull();

    fireEvent.press(screen.getByTestId("status-volumes-toggle"));

    expect(screen.getByTestId("status-volumes-grid")).toBeTruthy();
  });

  it("filtra volumes com count === 0 da exibicao", () => {
    const volumes = [
      { status: "FINALIZADA", count: 3 },
      { status: "ENTREGUE", count: 0 },
    ];

    const screen = render(<StatusVolumesPanel volumes={volumes} />);

    expect(screen.getByTestId("volume-chip-FINALIZADA")).toBeTruthy();
    expect(screen.queryByTestId("volume-chip-ENTREGUE")).toBeNull();
  });
});
