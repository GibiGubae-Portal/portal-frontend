import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import authReducer from "../../features/auth/authSlice";
import ProtectedRoute from "./ProtectedRoute";

const renderAt = (auth: Partial<ReturnType<typeof authReducer>>) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { ...authReducer(undefined, { type: "@@init" }), ...auth } },
  });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin/login" element={<p>login page</p>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <p>secret</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe("ProtectedRoute", () => {
  it("waits while the session is being restored", () => {
    renderAt({ hasInitialized: false });
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
    expect(screen.queryByText("login page")).not.toBeInTheDocument();
  });

  it("redirects anonymous visitors to the login page", () => {
    renderAt({ hasInitialized: true, isAuthenticated: false });
    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("renders the page for authenticated admins", () => {
    renderAt({ hasInitialized: true, isAuthenticated: true });
    expect(screen.getByText("secret")).toBeInTheDocument();
  });
});
