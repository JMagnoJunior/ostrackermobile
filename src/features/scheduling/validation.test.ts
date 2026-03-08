import { validateScheduleForm } from "./validation";

const TODAY = new Date();
const todayStr = [
  TODAY.getFullYear(),
  String(TODAY.getMonth() + 1).padStart(2, "0"),
  String(TODAY.getDate()).padStart(2, "0"),
].join("-");

const yesterday = new Date(TODAY);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = [
  yesterday.getFullYear(),
  String(yesterday.getMonth() + 1).padStart(2, "0"),
  String(yesterday.getDate()).padStart(2, "0"),
].join("-");

const tomorrow = new Date(TODAY);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = [
  tomorrow.getFullYear(),
  String(tomorrow.getMonth() + 1).padStart(2, "0"),
  String(tomorrow.getDate()).padStart(2, "0"),
].join("-");

describe("validateScheduleForm", () => {
  it("returns error when scheduledDate is empty", () => {
    const errors = validateScheduleForm({ scheduledDate: "", scheduledShift: "MANHA" });
    expect(errors.scheduledDate).toBeDefined();
    expect(errors.scheduledShift).toBeUndefined();
  });

  it("returns error when scheduledDate format is invalid", () => {
    const errors = validateScheduleForm({ scheduledDate: "08/03/2026", scheduledShift: "TARDE" });
    expect(errors.scheduledDate).toBeDefined();
  });

  it("returns error when scheduledDate is in the past", () => {
    const errors = validateScheduleForm({ scheduledDate: yesterdayStr, scheduledShift: "NOITE" });
    expect(errors.scheduledDate).toBeDefined();
  });

  it("returns no date error when scheduledDate is today", () => {
    const errors = validateScheduleForm({ scheduledDate: todayStr, scheduledShift: "MANHA" });
    expect(errors.scheduledDate).toBeUndefined();
  });

  it("returns no date error when scheduledDate is in the future", () => {
    const errors = validateScheduleForm({ scheduledDate: tomorrowStr, scheduledShift: "TARDE" });
    expect(errors.scheduledDate).toBeUndefined();
  });

  it("returns error when scheduledShift is empty", () => {
    const errors = validateScheduleForm({ scheduledDate: todayStr, scheduledShift: "" });
    expect(errors.scheduledShift).toBeDefined();
    expect(errors.scheduledDate).toBeUndefined();
  });

  it("returns no errors when both fields are valid", () => {
    const errors = validateScheduleForm({ scheduledDate: tomorrowStr, scheduledShift: "NOITE" });
    expect(errors).toEqual({});
  });
});
