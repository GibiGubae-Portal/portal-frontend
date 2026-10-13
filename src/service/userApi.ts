import { getRequest } from "../api/api";
import { UsersApiResponse } from "../types";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  batch?: number | null;
  participation?: string | null;
  gender?: string | null;
  sponsorshiptype?: string | null;
  cafeteriaaccess?: boolean | null;
  tookcourse?: boolean | null;
  departmentname?: string | null;
  clergicalstatus?: string | null;
}

/** Max page size the API accepts. */
export const MAX_PAGE_SIZE = 100;

export async function getUsers(
  params: GetUsersParams = {},
): Promise<UsersApiResponse> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query.append(key, String(value));
  }
  const qs = query.toString();
  return getRequest<UsersApiResponse>(qs ? `/user?${qs}` : "/user");
}
