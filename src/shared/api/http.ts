import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const runtimeProcess = globalThis as {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

const baseURL =
  runtimeProcess.process?.env?.EXPO_PUBLIC_API_BASE_URL?.trim() ||
  "http://localhost:8080";

export const http = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

type GetAccessTokenFn = () => Promise<string | null> | string | null;
type OnUnauthorizedFn = (status: 401 | 403) => Promise<void> | void;

type HttpAuthConfig = {
  getAccessToken?: GetAccessTokenFn;
  onUnauthorized?: OnUnauthorizedFn;
};

let getAccessToken: GetAccessTokenFn | undefined;
let onUnauthorized: OnUnauthorizedFn | undefined;
let unauthorizedRequestInFlight: Promise<void> | null = null;

function isAuthError(error: AxiosError): error is AxiosError & {
  response: AxiosResponse;
} {
  const status = error.response?.status;
  return status === 401 || status === 403;
}

function isAuthEndpoint(url?: string): boolean {
  return typeof url === "string" && url.includes("/api/auth/google");
}

function setAuthorizationHeader(
  config: InternalAxiosRequestConfig,
  token: string,
): void {
  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;
}

http.interceptors.request.use(async (config) => {
  if (!getAccessToken) {
    return config;
  }

  const token = await getAccessToken();
  if (!token) {
    return config;
  }

  setAuthorizationHeader(config, token);
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!isAuthError(error)) {
      return Promise.reject(error);
    }

    if (isAuthEndpoint(error.config?.url) || !onUnauthorized) {
      return Promise.reject(error);
    }

    if (!unauthorizedRequestInFlight) {
      unauthorizedRequestInFlight = Promise.resolve(
        onUnauthorized(error.response.status as 401 | 403),
      ).finally(() => {
        unauthorizedRequestInFlight = null;
      });
    }

    await unauthorizedRequestInFlight;
    return Promise.reject(error);
  },
);

export function configureHttpAuth(config: HttpAuthConfig): void {
  getAccessToken = config.getAccessToken;
  onUnauthorized = config.onUnauthorized;
}
