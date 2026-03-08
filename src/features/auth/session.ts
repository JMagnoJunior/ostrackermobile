export type AuthSessionResponse = {
  token: string;
  status: "PENDENTE_APROVACAO" | "ATIVO" | "INATIVO" | string;
  pending: boolean;
  role?: string | null;
};

export type AuthSession = {
  token: string;
  status: string;
  pending: boolean;
  role?: string;
};

export type AuthState =
  | { kind: "bootstrapping" }
  | { kind: "unauthenticated" }
  | { kind: "pending"; session: AuthSession }
  | { kind: "active"; session: AuthSession };

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function decodeBase64ToBytes(encoded: string): number[] | null {
  const cleaned = encoded.replace(/\s+/g, "");

  if (cleaned.length % 4 !== 0) {
    return null;
  }

  const bytes: number[] = [];

  for (let index = 0; index < cleaned.length; index += 4) {
    const chunk = cleaned.slice(index, index + 4);
    const values = chunk.split("").map((char) => {
      if (char === "=") {
        return 64;
      }

      return BASE64_ALPHABET.indexOf(char);
    });

    if (values.some((value) => value < 0)) {
      return null;
    }

    const [a, b, c, d] = values;
    const first = (a << 2) | (b >> 4);
    bytes.push(first & 255);

    if (c !== 64) {
      const second = ((b & 15) << 4) | (c >> 2);
      bytes.push(second & 255);
    }

    if (d !== 64 && c !== 64) {
      const third = ((c & 3) << 6) | d;
      bytes.push(third & 255);
    }
  }

  return bytes;
}

function normalizeRole(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();
  return normalized ? normalized : undefined;
}

export function extractRoleFromToken(token: string): string | undefined {
  const tokenParts = token.split(".");
  if (tokenParts.length < 2) {
    return undefined;
  }

  const payloadPart = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (payloadPart.length % 4)) % 4;
  const paddedPayload = `${payloadPart}${"=".repeat(padLength)}`;
  const decodedBytes = decodeBase64ToBytes(paddedPayload);

  if (!decodedBytes) {
    return undefined;
  }

  const decodedPayload = String.fromCharCode(...decodedBytes);

  try {
    const payload = JSON.parse(decodedPayload) as Record<string, unknown>;
    const roleValue = payload.role;
    return normalizeRole(typeof roleValue === "string" ? roleValue : undefined);
  } catch {
    return undefined;
  }
}

export function isSecretaryLikeRole(role: string | undefined): boolean {
  return role === "SECRETARIA" || role === "SUPERUSUARIO";
}

export function normalizeAuthSession(payload: AuthSessionResponse): AuthSession {
  const normalizedStatus = payload.status.trim();
  const isPendingStatus = normalizedStatus.toUpperCase() === "PENDENTE_APROVACAO";
  const normalizedRole = normalizeRole(payload.role) ?? extractRoleFromToken(payload.token);

  return {
    token: payload.token,
    status: normalizedStatus,
    pending: payload.pending || isPendingStatus,
    role: normalizedRole,
  };
}

export function getAuthStateFromSession(
  session: AuthSession,
): Extract<AuthState, { kind: "pending" | "active" }> {
  if (session.pending) {
    return {
      kind: "pending",
      session,
    };
  }

  return {
    kind: "active",
    session,
  };
}
