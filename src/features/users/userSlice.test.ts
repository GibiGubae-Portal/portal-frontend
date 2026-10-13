import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi } from "vitest";
import * as userApi from "../../service/userApi";
import reducer, { fetchUsers } from "./userSlice";

const makeStore = () => configureStore({ reducer: { user: reducer } });

describe("fetchUsers", () => {
  it("keeps at least one page for empty results", async () => {
    vi.spyOn(userApi, "getUsers").mockResolvedValue({
      success: true,
      users: [],
      pagination: {
        totalUsers: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      },
    });
    const store = makeStore();
    await store.dispatch(fetchUsers({ page: 1, limit: 10 }));
    expect(store.getState().user.pagination?.totalPages).toBe(1);
    expect(store.getState().user.loading).toBe(false);
  });

  it("survives a malformed response", async () => {
    vi.spyOn(userApi, "getUsers").mockResolvedValue(
      {} as Awaited<ReturnType<typeof userApi.getUsers>>,
    );
    const store = makeStore();
    await store.dispatch(fetchUsers());
    expect(store.getState().user.users).toEqual([]);
    expect(store.getState().user.pagination).not.toBeNull();
  });

  it("records the error message on failure", async () => {
    vi.spyOn(userApi, "getUsers").mockRejectedValue(new Error("Server down"));
    const store = makeStore();
    await store.dispatch(fetchUsers());
    expect(store.getState().user.error).toBe("Server down");
    expect(store.getState().user.loading).toBe(false);
  });
});
