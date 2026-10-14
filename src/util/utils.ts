export { getErrorMessage as extractError } from "../api/api";

/** "Hymns_and_Arts_Section" -> "Hymns and Arts Section"; tolerates null. */
export const humanize = (value: unknown, fallback = "N/A"): string => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value).replace(/_/g, " ");
};

/** Formats an ISO date for display without throwing on bad input. */
export const formatDate = (value: unknown, fallback = "N/A"): string => {
  if (!value) return fallback;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString();
};

/** Escapes text for safe interpolation into generated HTML documents. */
export const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Full name in Ethiopian order: first name, father's name, grandfather's name.
 * In the data model `lastname` is the father's name and `middlename` the
 * grandfather's name.
 */
export const fullName = (user: {
  firstname?: string | null;
  middlename?: string | null;
  lastname?: string | null;
}): string =>
  [user.firstname, user.lastname, user.middlename]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(" ");
