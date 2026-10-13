import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import UserForm from "./UserForm";
import { User } from "../../types";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

const apiUser: User = {
  userid: 1,
  studentid: "UGR-1234-16",
  firstname: "Abebe",
  middlename: "Kebede",
  lastname: "Tesfaye",
  gender: "Male",
  baptismalname: "None",
  phone: "0911223344",
  birthdate: "2000-01-15T00:00:00.000Z",
  useremail: null,
  telegram_username: "not_specified",
  nationality: "Ethiopian",
  region: "Not_Specified",
  mothertongue: "Not_Specified",
  zonename: "not_specified",
  isphysicallydisabled: "None",
  clergicalstatus: "Other",
  universityusers: {
    departmentname: "Information Systems",
    sponsorshiptype: "Government",
    participation: "None",
    batch: 2016,
    confessionfather: "not_specified",
    advisors: "No",
    role: "None",
    mealcard: null,
    cafeteriaaccess: null,
    holidayincampus: false,
    tookcourse: null,
    activitylevel: "Active",
  },
};

const renderForm = (initialData: User | null, mode: "add" | "edit" = "edit") => {
  const onSubmit = vi.fn();
  render(
    <UserForm mode={mode} initialData={initialData} onCancel={vi.fn()} onSubmit={onSubmit} />,
  );
  return { onSubmit, user: userEvent.setup() };
};

describe("UserForm", () => {
  it("round-trips an API user (Not_Specified enums, nulls) back to a valid payload", async () => {
    const { onSubmit, user } = renderForm(apiUser);
    expect(screen.getByDisplayValue("2000-01-15")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Update User" }));

    expect(Swal.fire).not.toHaveBeenCalled();
    const payload = onSubmit.mock.calls[0][0] as User;
    expect(payload).toMatchObject({
      studentid: "UGR-1234-16",
      region: "Not_Specified",
      mothertongue: "Not_Specified",
      birthdate: "2000-01-15",
      telegram_username: "",
      useremail: null,
    });
    expect(payload.universityusers?.role).toBe("None");
  });

  it("does not crash for a legacy user without university data or with null text", async () => {
    const legacy = {
      ...apiUser,
      middlename: null,
      birthdate: "garbage",
      universityusers: undefined,
    } as unknown as User;
    const { onSubmit, user } = renderForm(legacy);

    // Renders with empty (required) fields instead of throwing.
    expect(screen.getByPlaceholderText("Information System")).toHaveValue("");
    await user.click(screen.getByRole("button", { name: "Update User" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("accepts Safaricom (07) numbers and rejects garbage phone numbers", async () => {
    const { onSubmit, user } = renderForm({ ...apiUser, phone: "0711223344" });
    await user.click(screen.getByRole("button", { name: "Update User" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    const phone = screen.getByDisplayValue("0711223344");
    await user.clear(phone);
    await user.type(phone, "12345");
    await user.click(screen.getByRole("button", { name: "Update User" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(Swal.fire).toHaveBeenCalled();
  });

  it("requires a role when participating in a section", async () => {
    const { onSubmit, user } = renderForm({
      ...apiUser,
      universityusers: { ...apiUser.universityusers!, participation: "Hymns_and_Arts_Section", role: "None" },
    });
    await user.click(screen.getByRole("button", { name: "Update User" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables submit while saving", () => {
    render(
      <UserForm mode="add" initialData={null} onCancel={vi.fn()} onSubmit={vi.fn()} isSubmitting />,
    );
    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });
});
