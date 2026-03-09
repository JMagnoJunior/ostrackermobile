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

  it("does not render approve delivery button when status is not AGENDADA_DELIVERY even with prop", () => {
    const screen = render(
      <OrderListItem
        item={{ ...baseItem, status: "FINALIZADA" }}
        onApproveDelivery={jest.fn()}
        selectedFilter="ATRASADOS"
      />,
    );

    expect(screen.queryByTestId("btn-approve-delivery")).toBeNull();
  });

  it("does not render approve delivery button when status is AGENDADA_DELIVERY but prop is not provided", () => {
    const screen = render(
      <OrderListItem
        item={{ ...baseItem, status: "AGENDADA_DELIVERY" }}
        selectedFilter="ATRASADOS"
      />,
    );

    expect(screen.queryByTestId("btn-approve-delivery")).toBeNull();
  });

  it("renders approve delivery button when status is AGENDADA_DELIVERY and prop is provided", () => {
    const screen = render(
      <OrderListItem
        item={{ ...baseItem, status: "AGENDADA_DELIVERY" }}
        onApproveDelivery={jest.fn()}
        selectedFilter="ATRASADOS"
      />,
    );

    expect(screen.getByTestId("btn-approve-delivery")).toBeTruthy();
  });

  it("calls onApproveDelivery when approve delivery button is pressed", () => {
    const onApproveDelivery = jest.fn();
    const screen = render(
      <OrderListItem
        item={{ ...baseItem, status: "AGENDADA_DELIVERY" }}
        onApproveDelivery={onApproveDelivery}
        selectedFilter="ATRASADOS"
      />,
    );

    fireEvent.press(screen.getByTestId("btn-approve-delivery"));

    expect(onApproveDelivery).toHaveBeenCalledTimes(1);
  });

  it("renders checkin button when status is AGENDADA_PRESENCIAL and onCheckin is provided", () => {
    const screen = render(
      <OrderListItem
        item={{ ...baseItem, status: "AGENDADA_PRESENCIAL" }}
        onCheckin={jest.fn()}
        selectedFilter="ATRASADOS"
      />,
    );

    expect(screen.getByTestId("btn-checkin")).toBeTruthy();
  });

  it("renders checkin button when status is AGENDADA_DELIVERY and onCheckin is provided", () => {
    const screen = render(
      <OrderListItem
        item={{ ...baseItem, status: "AGENDADA_DELIVERY" }}
        onCheckin={jest.fn()}
        selectedFilter="ATRASADOS"
      />,
    );

    expect(screen.getByTestId("btn-checkin")).toBeTruthy();
  });

  it("calls onCheckin when checkin button is pressed", () => {
    const onCheckin = jest.fn();
    const screen = render(
      <OrderListItem
        item={{ ...baseItem, status: "AGENDADA_PRESENCIAL" }}
        onCheckin={onCheckin}
        selectedFilter="ATRASADOS"
      />,
    );

    fireEvent.press(screen.getByTestId("btn-checkin"));

    expect(onCheckin).toHaveBeenCalledTimes(1);
  });

  it("does not render checkin button when status is not AGENDADA_PRESENCIAL or AGENDADA_DELIVERY even with prop", () => {
    const screen = render(
      <OrderListItem
        item={{ ...baseItem, status: "FINALIZADA" }}
        onCheckin={jest.fn()}
        selectedFilter="ATRASADOS"
      />,
    );

    expect(screen.queryByTestId("btn-checkin")).toBeNull();
  });

  it("does not render checkin button when status is AGENDADA_PRESENCIAL but onCheckin is not provided", () => {
    const screen = render(
      <OrderListItem
        item={{ ...baseItem, status: "AGENDADA_PRESENCIAL" }}
        selectedFilter="ATRASADOS"
      />,
    );

    expect(screen.queryByTestId("btn-checkin")).toBeNull();
  });

  it("renders both btn-checkin and btn-approve-delivery for AGENDADA_DELIVERY with both props", () => {
    const screen = render(
      <OrderListItem
        item={{ ...baseItem, status: "AGENDADA_DELIVERY" }}
        onApproveDelivery={jest.fn()}
        onCheckin={jest.fn()}
        selectedFilter="ATRASADOS"
      />,
    );

    expect(screen.getByTestId("btn-checkin")).toBeTruthy();
    expect(screen.getByTestId("btn-approve-delivery")).toBeTruthy();
  });

  it("existing onEditSchedule and onAddContactLog tests pass with new optional prop", () => {
    const onEditSchedule = jest.fn();
    const onAddContactLog = jest.fn();
    const screen = render(
      <OrderListItem
        item={baseItem}
        onAddContactLog={onAddContactLog}
        onEditSchedule={onEditSchedule}
        selectedFilter="ATRASADOS"
      />,
    );

    fireEvent.press(screen.getByTestId("btn-edit-schedule"));
    fireEvent.press(screen.getByTestId("btn-add-contact-log"));

    expect(onEditSchedule).toHaveBeenCalledTimes(1);
    expect(onAddContactLog).toHaveBeenCalledTimes(1);
  });
});
