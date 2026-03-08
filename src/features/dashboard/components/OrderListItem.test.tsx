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

  it("does not render contact log button when onAddContactLog is not provided", () => {
    const screen = render(
      <OrderListItem item={baseItem} selectedFilter="ATRASADOS" />,
    );

    expect(screen.queryByTestId("btn-add-contact-log")).toBeNull();
  });

  it("renders contact log button when onAddContactLog is provided", () => {
    const screen = render(
      <OrderListItem
        item={baseItem}
        onAddContactLog={jest.fn()}
        selectedFilter="ATRASADOS"
      />,
    );

    expect(screen.getByTestId("btn-add-contact-log")).toBeTruthy();
  });

  it("calls onAddContactLog when contact log button is pressed", () => {
    const onAddContactLog = jest.fn();
    const screen = render(
      <OrderListItem
        item={baseItem}
        onAddContactLog={onAddContactLog}
        selectedFilter="ATRASADOS"
      />,
    );

    fireEvent.press(screen.getByTestId("btn-add-contact-log"));

    expect(onAddContactLog).toHaveBeenCalledTimes(1);
  });

  it("renders both edit and contact log buttons when both props are provided", () => {
    const screen = render(
      <OrderListItem
        item={baseItem}
        onAddContactLog={jest.fn()}
        onEditSchedule={jest.fn()}
        selectedFilter="ATRASADOS"
      />,
    );

    expect(screen.getByTestId("btn-edit-schedule")).toBeTruthy();
    expect(screen.getByTestId("btn-add-contact-log")).toBeTruthy();
  });
});
