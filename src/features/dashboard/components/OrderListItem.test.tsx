import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { DashboardOrderItem } from "../types";
import { OrderListItem } from "./OrderListItem";

const baseItem: DashboardOrderItem = {
  id: "order-1",
  clientName: "Cliente Teste",
  clientPhone: "5511999990001",
  status: "FINALIZADA",
  finishedAt: "2026-03-01T10:00:00Z",
  monitoringFilter: "ATRASADOS",
};

describe("OrderListItem", () => {
  it("does not render edit button when onEditSchedule is not provided", () => {
    const screen = render(
      <OrderListItem item={baseItem} selectedFilter="ATRASADOS" />,
    );

    expect(screen.queryByTestId("btn-edit-schedule")).toBeNull();
  });

  it("renders edit button when onEditSchedule is provided", () => {
    const screen = render(
      <OrderListItem
        item={baseItem}
        onEditSchedule={jest.fn()}
        selectedFilter="ATRASADOS"
      />,
    );

    expect(screen.getByTestId("btn-edit-schedule")).toBeTruthy();
  });

  it("calls onEditSchedule when edit button is pressed", () => {
    const onEditSchedule = jest.fn();
    const screen = render(
      <OrderListItem
        item={baseItem}
        onEditSchedule={onEditSchedule}
        selectedFilter="ATRASADOS"
      />,
    );

    fireEvent.press(screen.getByTestId("btn-edit-schedule"));

    expect(onEditSchedule).toHaveBeenCalledTimes(1);
  });
});
