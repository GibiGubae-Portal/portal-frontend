import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UserDetail from "./UserDetail";
import { User } from "../../types";

describe("UserDetail", () => {
  it("renders users with missing / null fields without crashing", () => {
    const sparse = {
      studentid: "UGR-1-16",
      firstname: "Abebe",
      lastname: "Tesfaye",
      middlename: null,
      birthdate: "not-a-date",
      universityusers: {
        departmentname: "IS",
        batch: null,
        participation: null,
        role: undefined,
      },
    } as unknown as User;

    render(<UserDetail user={sparse} onClose={vi.fn()} />);
    expect(screen.getByText("Abebe Tesfaye")).toBeInTheDocument(); // middlename is null
    expect(screen.getAllByText("N/A").length).toBeGreaterThan(3);
  });
});
