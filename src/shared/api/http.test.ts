import { InternalAxiosRequestConfig } from "axios";

import { configureHttpAuth, http } from "./http";

function readAuthorizationHeader(config: InternalAxiosRequestConfig): string | null {
  const headers = config.headers as
    | (Record<string, unknown> & { get?: (name: string) => string | undefined })
    | undefined;

  if (!headers) {
    return null;
  }

  if (typeof headers.get === "function") {
    return headers.get("Authorization") ?? headers.get("authorization") ?? null;
  }

  const authorization =
    (headers.Authorization as string | undefined) ??
    (headers.authorization as string | undefined);

  return authorization ?? null;
}

describe("http auth interceptors", () => {
  afterEach(() => {
    configureHttpAuth({});
  });

  it("injects bearer token when a session token exists", async () => {
    configureHttpAuth({
      getAccessToken: async () => "jwt-token",
    });

    const response = await http.request<{ authorization: string | null }>({
      method: "GET",
      url: "/api/ping",
      adapter: async (config) => ({
        data: {
          authorization: readAuthorizationHeader(config),
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }),
    });

    expect(response.data.authorization).toBe("Bearer jwt-token");
  });
});
