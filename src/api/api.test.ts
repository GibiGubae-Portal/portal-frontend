import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { describe, expect, it, vi } from "vitest";
import { api, getErrorMessage, setUnauthorizedHandler } from "./api";

const axiosError = (status?: number, data?: unknown, code?: string) => {
  const config = { headers: new AxiosHeaders(), url: "/user" } as InternalAxiosRequestConfig;
  return new AxiosError(
    "Request failed",
    code,
    config,
    {},
    status
      ? { status, statusText: "", headers: {}, config, data }
      : undefined,
  );
};

describe("api client", () => {
  it("defaults to the same-origin /api base URL", () => {
    expect(api.defaults.baseURL).toBe("/api");
    expect(api.defaults.withCredentials).toBe(true);
  });

  it("calls the unauthorized handler on 401 from protected endpoints only", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);

    const respond = (url: string) =>
      api.get(url, {
        adapter: async (config) => {
          throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, {}, {
            status: 401,
            statusText: "Unauthorized",
            headers: {},
            config,
            data: { message: "Not authenticated" },
          });
        },
      });

    await expect(respond("/user")).rejects.toBeTruthy();
    expect(handler).toHaveBeenCalledTimes(1);

    await expect(respond("/auth/current")).rejects.toBeTruthy();
    await expect(respond("/admin/login")).rejects.toBeTruthy();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe("getErrorMessage", () => {
  it("prefers the server's message", () => {
    expect(getErrorMessage(axiosError(409, { message: "Duplicate phone" }))).toBe(
      "Duplicate phone",
    );
  });

  it("explains network failures and timeouts", () => {
    expect(getErrorMessage(axiosError())).toMatch(/Cannot reach the server/);
    expect(getErrorMessage(axiosError(undefined, undefined, "ECONNABORTED"))).toMatch(
      /too long/,
    );
  });

  it("falls back sensibly for other values", () => {
    expect(getErrorMessage(axiosError(500, "<html>"))).toMatch(/Something went wrong/);
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
    expect(getErrorMessage("plain")).toBe("plain");
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
  });
});
