import {
  extractRoleFromToken,
  getAuthStateFromSession,
  isSecretaryLikeRole,
  isSuperusuario,
  normalizeAuthSession,
} from "./session";

function buildJwt(payload: Record<string, unknown>): string {
  const encodePart = (value: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  return `${encodePart({ alg: "HS256", typ: "JWT" })}.${encodePart(payload)}.signature`;
}

describe("normalizeAuthSession", () => {
  it("marks session as pending when payload.pending is true", () => {
    const session = normalizeAuthSession({
      token: "jwt",
      status: "ATIVO",
      pending: true,
    });

    expect(session.pending).toBe(true);
  });

  it("marks session as pending when status is PENDENTE_APROVACAO", () => {
    const session = normalizeAuthSession({
      token: "jwt",
      status: "PENDENTE_APROVACAO",
      pending: false,
    });

    expect(session.pending).toBe(true);
  });

  it("keeps session active when status is active and pending is false", () => {
    const session = normalizeAuthSession({
      token: "jwt",
      status: "ATIVO",
      pending: false,
    });

    expect(getAuthStateFromSession(session).kind).toBe("active");
  });

  it("extracts role from response payload when available", () => {
    const session = normalizeAuthSession({
      token: "jwt",
      status: "ATIVO",
      pending: false,
      role: " secretaria ",
    });

    expect(session.role).toBe("SECRETARIA");
  });

  it("extracts role from jwt payload when response role is missing", () => {
    const token = buildJwt({ role: "SUPERUSUARIO" });
    const session = normalizeAuthSession({
      token,
      status: "ATIVO",
      pending: false,
    });

    expect(session.role).toBe("SUPERUSUARIO");
  });
});

describe("role helpers", () => {
  it("returns undefined for invalid jwt payload", () => {
    expect(extractRoleFromToken("invalid-token")).toBeUndefined();
  });

  it("identifies secretary-like roles", () => {
    expect(isSecretaryLikeRole("SECRETARIA")).toBe(true);
    expect(isSecretaryLikeRole("SUPERUSUARIO")).toBe(true);
    expect(isSecretaryLikeRole("TECNICO")).toBe(false);
  });
});

describe("isSuperusuario", () => {
  it("returns true for SUPERUSUARIO", () => {
    expect(isSuperusuario("SUPERUSUARIO")).toBe(true);
  });

  it("returns false for SECRETARIA", () => {
    expect(isSuperusuario("SECRETARIA")).toBe(false);
  });

  it("returns false for TECNICO", () => {
    expect(isSuperusuario("TECNICO")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isSuperusuario(undefined)).toBe(false);
  });
});
