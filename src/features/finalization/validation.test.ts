import {
  buildFinalizationPayload,
  hasValidationErrors,
  validateFinalizationForm,
} from "./validation";

describe("validateFinalizationForm", () => {
  it("accepts valid data", () => {
    const errors = validateFinalizationForm({
      technicalSummary: "Resumo tecnico",
      finalValue: "199.90",
      clientName: "Joao Silva",
      clientPhone: "5511999999999",
    });

    expect(hasValidationErrors(errors)).toBe(false);
  });

  it("rejects empty client name", () => {
    const errors = validateFinalizationForm({
      technicalSummary: "",
      finalValue: "199.90",
      clientName: " ",
      clientPhone: "5511999999999",
    });

    expect(errors.clientName).toBeDefined();
  });

  it("rejects invalid phone", () => {
    const errors = validateFinalizationForm({
      technicalSummary: "",
      finalValue: "199.90",
      clientName: "Joao Silva",
      clientPhone: "11-99999-9999",
    });

    expect(errors.clientPhone).toBeDefined();
  });

  it("rejects missing final value", () => {
    const errors = validateFinalizationForm({
      technicalSummary: "",
      finalValue: "",
      clientName: "Joao Silva",
      clientPhone: "5511999999999",
    });

    expect(errors.finalValue).toBeDefined();
  });

  it("rejects zero or negative final value", () => {
    const zeroErrors = validateFinalizationForm({
      technicalSummary: "",
      finalValue: "0",
      clientName: "Joao Silva",
      clientPhone: "5511999999999",
    });

    const negativeErrors = validateFinalizationForm({
      technicalSummary: "",
      finalValue: "-10",
      clientName: "Joao Silva",
      clientPhone: "5511999999999",
    });

    expect(zeroErrors.finalValue).toBeDefined();
    expect(negativeErrors.finalValue).toBeDefined();
  });
});

describe("buildFinalizationPayload", () => {
  it("trims fields and converts final value", () => {
    const payload = buildFinalizationPayload({
      technicalSummary: "  resumo  ",
      finalValue: "250,50",
      clientName: "  Joao Silva  ",
      clientPhone: " 5511999999999 ",
    });

    expect(payload).toEqual({
      technicalSummary: "resumo",
      finalValue: 250.5,
      clientName: "Joao Silva",
      clientPhone: "5511999999999",
    });
  });

  it("sends technicalSummary as undefined when empty", () => {
    const payload = buildFinalizationPayload({
      technicalSummary: "   ",
      finalValue: "120",
      clientName: "Cliente",
      clientPhone: "5511988887777",
    });

    expect(payload.technicalSummary).toBeUndefined();
  });
});
