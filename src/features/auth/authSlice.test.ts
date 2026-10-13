import { describe, expect, it } from "vitest";
import reducer, {
  fetchCurrentUser,
  loginAdmin,
  sessionExpired,
} from "./authSlice";
import { DEFAULT_PERMISSIONS } from "../../types";

const session = {
  admin: {
    studentid: "A-1",
    adminusername: "Admin",
    isSuperAdmin: false,
    role: "Admin" as const,
    permissions: DEFAULT_PERMISSIONS,
  },
  currentUserData: {
    username: "Admin",
    studentid: "A-1",
    isSuperAdmin: false,
    permissions: DEFAULT_PERMISSIONS,
  },
};

const initial = reducer(undefined, { type: "@@init" });

describe("authSlice", () => {
  it("marks the session restored on a successful probe", () => {
    const state = reducer(initial, fetchCurrentUser.fulfilled(session, "r1"));
    expect(state).toMatchObject({ hasInitialized: true, isAuthenticated: true });
  });

  it("does not let a late failed probe log out a fresh login", () => {
    let state = reducer(initial, fetchCurrentUser.pending("r1"));
    state = reducer(state, loginAdmin.pending("r2", { studentId: "A-1", password: "x" }));
    state = reducer(state, loginAdmin.fulfilled(session, "r2", { studentId: "A-1", password: "x" }));
    state = reducer(state, fetchCurrentUser.rejected(null, "r1", undefined, "No session"));
    expect(state.isAuthenticated).toBe(true);
    expect(state.status).toBe("authenticated");
  });

  it("clears the session and explains why when it expires", () => {
    let state = reducer(initial, fetchCurrentUser.fulfilled(session, "r1"));
    state = reducer(state, sessionExpired());
    expect(state.isAuthenticated).toBe(false);
    expect(state.currentUserData).toBeNull();
    expect(state.error).toMatch(/expired/);
  });

  it("stores the login error message", () => {
    const state = reducer(
      initial,
      loginAdmin.rejected(null, "r", { studentId: "x", password: "y" }, "Invalid student ID or password"),
    );
    expect(state.error).toBe("Invalid student ID or password");
    expect(state.isAuthenticated).toBe(false);
  });
});
