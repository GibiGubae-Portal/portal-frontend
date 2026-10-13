// src/components/forms/UserForm.tsx
import { useState, ChangeEvent, FormEvent, memo } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import { UniversityUser, User } from "../../types";

interface UserFormProps {
  mode: "add" | "edit";
  initialData: User | null;
  onCancel: () => void;
  onSubmit: (user: User) => void;
  isSubmitting?: boolean;
}

const defaultUser: User = {
  studentid: "",
  firstname: "",
  middlename: "",
  lastname: "",
  gender: "Male",
  baptismalname: "",
  phone: "",
  birthdate: "",
  useremail: null,
  telegram_username: "",
  nationality: "Ethiopian",
  region: "Addis_Ababa",
  mothertongue: "Amharic",
  zonename: "",
  isphysicallydisabled: "None",
  clergicalstatus: "None",
  universityusers: {
    departmentname: "",
    sponsorshiptype: "Government",
    participation: "None",
    batch: 2014,
    confessionfather: "Not Specified",
    advisors: "No",
    role: "None",
    mealcard: null,
    cafeteriaaccess: false,
    cafeterianame: null,
    holidayincampus: false,
    tookcourse: false,
    activitylevel: "Active",
  },
};

// Enums remain the same
const role_type = [
  ["Member", "Member"],
  ["ClassSecretary", "Class Secretary"],
  ["ClassTeamLead", "Class Team Lead"],
  ["ClassManager", "Class Manager"],
  ["SubclassSecretary", "Subclass Secretary"],
  ["SubclassTeamLead", "Subclass Team Lead"],
  ["SubclassManager", "Subclass Manager"],
  ["None", "None"],
];

const participation_enum: [string, string][] = [
  ["Gbi_Gubaye_Secretariat", "የግቢ ጉባኤው ጽ/ቤት"],
  ["Audit_and_Inspection_Section", "ኦዲትና ኢንስፔክሽን ክፍል"],
  ["Education_and_Apostolic_Service_Section", "ትምህርትና ሐዋርያው አገልግሎት ክፍል"],
  ["Accounting_and_Assets_Section", "የሒሳብና ንብረት ክፍል"],
  ["Development_and_Income_Collection_Section", "ልማትና ገቢ አሰባሰብ ክፍል"],
  ["Languages_and_Special_Interests_Section", "ቋንቋዎችና ልዩ ፍላጎት ክፍል"],
  ["Hymns_and_Arts_Section", "መዝሙርና ስነ ጥበባት ክፍል"],
  [
    "Planning_Monitoring_Reports_and_Information_Management_Section",
    "ዕቅድ ክትትል ሪፓርትና መረጃ ማደራጃ ክፍል",
  ],
  ["Professional_and_Community_Development_Section", "የሞያና በጎ አድራጎት ክፍል"],
  ["Batch_and_Programs_Coordination_Section", "የባችና መርሀግራት ማስተባበሪያ ክፍል"],
  [
    "Member_Care_Advice_and_Capacity_Building_Section",
    "የአባላት እንክብካቤ ምክክርና አቅም ማጎልበቻ ክፍል",
  ],
  ["None", "ምንም አይደለም"],
];

const region_enum = [
  ["Addis_Ababa", "Addis Ababa"],
  ["Dire_Dawa", "Dire Dawa"],
  ["Tigray", "Tigray"],
  ["Afar", "Afar"],
  ["Amhara", "Amhara"],
  ["Oromia", "Oromia"],
  ["Somali", "Somali"],
  ["Benishangul_Gumuz", "Benishangul-Gumuz"],
  ["SNNPR", "SNNPR"],
  ["Sidama", "Sidama"],
  ["South_West_Ethiopia_Peoples_Region", "South West Ethiopia Peoples Region"],
  ["Central_Ethiopia_Region", "Central Ethiopia Region"],
  ["South_Ethiopia_Region", "South Ethiopia Region"],
  ["Harari", "Harari"],
  ["Not_Specified", "Not Specified"],
];

const mother_tongue_enum = [
  ["Amharic", "Amharic"],
  ["Oromifa", "Oromifa"],
  ["Tigrigna", "Tigrigna"],
  ["English", "English"],
  ["Not_Specified", "Not Specified"],
  ["Other", "Other"],
];

const universityusers_enum = [
  ["departmentname", "Department", "text", "required", "Information System"],
  ["batch", "Batch", "number", "required", "2016"],
  ["mealcard", "Meal Card (optional)", "text", "optional", "****"],
  [
    "confessionfather",
    "Confession Father (optional)",
    "text",
    "optional",
    "Abba Tesfaye",
  ],
  ["cafeterianame", "Cafeteria Name (optional)", "text", "optional", ""],
  [
    "emergencyname",
    "Emergency Contact Name (optional)",
    "text",
    "optional",
    "",
  ],
  ["emergencyphone", "Emergency Phone (optional)", "text", "optional", ""],
];

const user_enum = [
  [
    "studentid",
    "Student ID",
    "text",
    "required",
    "UGR-****-** (use hyphen only)",
  ],
  ["firstname", "First Name", "text", "required", "Berhanu"],
  ["lastname", "Father's Name", "text", "required", "Tesfaye"],
  [
    "middlename",
    "Grandfather's Name (optional)",
    "text",
    "optional",
    "Amanuel",
  ],
  [
    "baptismalname",
    "Baptismal Name (optional)",
    "text",
    "optional",
    "Welde Amanuel",
  ],
  ["phone", "Phone Number", "tel", "required", "+2519********"],
  ["birthdate", "Birthdate", "date", "required", ""],
  [
    "telegram_username",
    "Telegram Username (optional)",
    "text",
    "optional",
    "@berhanu123",
  ],
  ["useremail", "Email (optional)", "email", "optional", "someone@gmail.com"],
  ["zonename", "Zone (optional)", "text", "optional", "Gedeo"],
  ["nationality", "Nationality", "text", "required", "Ethiopian"],
];

function getUniversityUserValue<K extends keyof UniversityUser>(
  obj: UniversityUser | undefined,
  key: K
): string | number {
  const value = obj?.[key];

  if (value === null || value === undefined) {
    if (key === "batch") return "";
    if (key === "mealcard" || key === "confessionfather")
      return "not_specified";
    return "";
  }

  if (key === "batch") return value as number;

  return String(value);
}

const toDateInputValue = (value: Date | string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};

const normalizeEnum = (value: string | undefined, fallback: string) =>
  !value || value === "not_specified" ? fallback : value;

/**
 * Builds a complete form state from an API user: older records may have null
 * text fields or no university record at all, which must not crash the form.
 */
const toFormState = (user: User | null): User => {
  if (!user) return { ...defaultUser, universityusers: { ...defaultUser.universityusers! } };
  return {
    ...defaultUser,
    ...user,
    middlename: user.middlename ?? "",
    baptismalname: user.baptismalname === "None" ? "" : user.baptismalname ?? "",
    telegram_username:
      user.telegram_username === "not_specified" ? "" : user.telegram_username ?? "",
    zonename: user.zonename === "not_specified" ? "" : user.zonename ?? "",
    useremail: user.useremail === "not_specified" ? null : user.useremail ?? null,
    region: normalizeEnum(user.region, "Not_Specified") as User["region"],
    mothertongue: normalizeEnum(user.mothertongue, "Not_Specified") as User["mothertongue"],
    universityusers: {
      ...defaultUser.universityusers!,
      ...(user.universityusers ?? {}),
    },
  };
};

function UserForm({
  mode,
  initialData,
  onCancel,
  onSubmit,
  isSubmitting = false,
}: UserFormProps) {
  const [formData, setFormData] = useState<User>(() => toFormState(initialData));

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof User] as object),
          [child]:
            checked !== undefined
              ? checked
              : value || (child === "batch" ? null : value),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: checked !== undefined ? checked : value,
      }));
    }
  };

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    const studentId = (formData.studentid ?? "").trim();
    if (!studentId) newErrors.push("Student ID is required.");
    else if (/[/\\?#%]/.test(studentId))
      newErrors.push("Student ID cannot contain '/', '\\', '?', '#' or '%'. Use '-' instead.");

    if (!(formData.firstname ?? "").trim()) newErrors.push("First Name is required.");
    if (!(formData.lastname ?? "").trim()) newErrors.push("Father's Name is required.");
    const phone = (formData.phone ?? "").replace(/\s/g, "");
    if (!phone) newErrors.push("Phone number is required.");
    else if (!/^(\+251|0)[79]\d{8}$/.test(phone))
      newErrors.push(
        "Invalid Ethiopian phone number (e.g., +251911223344, 0911223344 or 0711223344)."
      );

    if (!(formData.nationality ?? "").trim())
      newErrors.push("Nationality is required.");

    const birthdate = new Date(formData.birthdate);
    if (Number.isNaN(birthdate.getTime())) newErrors.push("Birthdate is required.");
    else if (birthdate > new Date()) newErrors.push("Birthdate cannot be in the future.");

    const email = (formData.useremail ?? "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push("Please enter a valid email address.");
    }

    if (!formData.universityusers?.departmentname?.trim())
      newErrors.push("Department name is required.");

    const batch = Number(formData.universityusers?.batch);
    if (!Number.isInteger(batch) || batch <= 1900 || batch > 2200)
      newErrors.push("Valid batch year is required (e.g., 2016).");

    if (
      formData.universityusers?.participation !== "None" &&
      formData.universityusers?.role === "None"
    ) {
      newErrors.push("Role cannot be 'None' if participating in a section.");
    }

    return newErrors;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const newErrors = validateForm();
    if (newErrors.length > 0) {
      const list = document.createElement("ul");
      list.style.textAlign = "left";
      for (const message of newErrors) {
        const item = document.createElement("li");
        item.textContent = `• ${message}`;
        list.appendChild(item);
      }
      Swal.fire({
        icon: "warning",
        title: "Please fix the following",
        html: list,
      });
      return;
    }

    const university = formData.universityusers!;
    const text = (value: string | null | undefined) => (value ?? "").trim();
    // Final cleanup before submit
    const cleanedData: User = {
      ...formData,
      studentid: text(formData.studentid),
      firstname: text(formData.firstname),
      middlename: text(formData.middlename),
      lastname: text(formData.lastname),
      baptismalname: text(formData.baptismalname),
      phone: formData.phone.replace(/\s/g, ""),
      useremail: text(formData.useremail) || null,
      telegram_username: text(formData.telegram_username),
      zonename: text(formData.zonename),
      nationality: text(formData.nationality),
      birthdate: toDateInputValue(formData.birthdate),
      universityusers: {
        ...university,
        departmentname: text(university.departmentname),
        batch: Number(university.batch),
        confessionfather: text(university.confessionfather) || "Not Specified",
        mealcard: text(university.mealcard) || "Not Specified",
        role: university.participation === "None" ? "None" : university.role,
      },
    };

    onSubmit(cleanedData);
  };

  return (
    <div className="p-4 sm:p-6 max-w-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">
          {mode === "add" ? "Add New User" : "Edit User"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close form"
        >
          <X size={24} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 overflow-y-auto max-h-[70vh]"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {user_enum.map(([key, label, inputType, , placeholder]) => (
            <div key={key as string}>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">
                {label as string}
              </label>
              <input
                type={inputType as string}
                placeholder={placeholder as string}
                name={key as keyof User}
                value={
                  key === "birthdate"
                    ? toDateInputValue(formData.birthdate)
                    : (formData[key as keyof User] as string) ?? ""
                }
                max={key === "birthdate" ? toDateInputValue(new Date()) : undefined}
                onChange={handleChange}
                required={[
                  "studentid",
                  "firstname",
                  "lastname",
                  "phone",
                  "nationality",
                  "birthdate",
                ].includes(key as string)}
                className="w-full text-sm px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              {region_enum.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Has Advisor?
            </label>
            <select
              name="universityusers.advisors"
              value={formData.universityusers?.advisors || "No"}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Physical Impairment?
            </label>
            <select
              name="isphysicallydisabled"
              value={formData.isphysicallydisabled}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="None">None</option>
              <option value="Physical">Physical</option>
              <option value="Visual">Visual</option>
              <option value="Hearing">Hearing</option>
              <option value="Intellectual">Intellectual</option>
              <option value="Psychosocial">Psychosocial</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mother Tongue
            </label>
            <select
              name="mothertongue"
              value={formData.mothertongue}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              {mother_tongue_enum.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h4 className="text-lg font-semibold pt-6">University Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {universityusers_enum.map(
            ([key, label, inputType, , placeholder]) => (
              <div key={`universityusers.${key}`}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type={inputType}
                  placeholder={placeholder as string}
                  name={`universityusers.${key}`}
                  value={getUniversityUserValue(
                    formData.universityusers,
                    key as keyof UniversityUser
                  )}
                  onChange={handleChange}
                  required={key === "departmentname" || key === "batch"}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sponsorship Type
            </label>
            <select
              name="universityusers.sponsorshiptype"
              value={formData.universityusers?.sponsorshiptype}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="Government">Government</option>
              <option value="Self_Sponsored">Self Sponsored</option>
              <option value="Scholarship">Scholarship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participation
            </label>
            <select
              name="universityusers.participation"
              value={formData.universityusers?.participation}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              {participation_enum.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="universityusers.role"
              value={formData.universityusers?.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              {role_type.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Level
            </label>
            <select
              name="universityusers.activitylevel"
              value={formData.universityusers?.activitylevel}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="Very_Active">Very Active</option>
              <option value="Active">Active</option>
              <option value="Less_Active">Less Active</option>
              <option value="Not_Active">Not Active</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clergy Status
            </label>
            <select
              name="clergicalstatus"
              value={formData.clergicalstatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="None">None</option>
              <option value="Deacon">Deacon</option>
              <option value="Priest">Priest</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="universityusers.cafeteriaaccess"
              checked={!!formData.universityusers?.cafeteriaaccess}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Cafeteria Access
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="universityusers.holidayincampus"
              checked={!!formData.universityusers?.holidayincampus}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Holiday in Campus
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="universityusers.tookcourse"
              checked={!!formData.universityusers?.tookcourse}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Took Course?</label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Saving..."
              : mode === "add"
                ? "Add User"
                : "Update User"}
          </button>
        </div>
      </form>
    </div>
  );
}

const UserFormMemo = memo(UserForm);
export default UserFormMemo;
