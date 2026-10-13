import {
  createAsyncThunk,
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";
import { deleteRequest, getRequest, postRequest, putRequest } from "../../api/api";
import { getUsers, GetUsersParams } from "../../service/userApi";
import { AnalyticsData, Pagination, User } from "../../types";
import { extractError } from "../../util/utils";

interface UserState {
  users: User[];
  /** True while the user list is loading. */
  loading: boolean;
  /** True while a create/update/delete request is in flight. */
  saving: boolean;
  error: string | null;
  pagination: Pagination | null;
  analytics: AnalyticsData | null;
  analyticsLoading: boolean;
  analyticsError: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  saving: false,
  error: null,
  pagination: null,
  analytics: null,
  analyticsLoading: false,
  analyticsError: null,
};

export type FetchUsersParams = GetUsersParams;

type TFetchResponse = {
  users: User[];
  success: boolean;
  pagination: Pagination;
};

export const fetchUsers = createAsyncThunk<
  TFetchResponse,
  FetchUsersParams | undefined,
  { rejectValue: string }
>("user/fetchUsers", async (params, { rejectWithValue }) => {
  try {
    const p = params ?? {};
    const res = await getUsers(p);
    const users = Array.isArray(res?.users) ? res.users : [];
    const pagination: Pagination = res?.pagination ?? {
      totalUsers: users.length,
      totalPages: 1,
      currentPage: p.page ?? 1,
      limit: p.limit ?? users.length,
      hasNext: false,
      hasPrev: false,
    };
    return {
      success: true,
      users,
      // Keep at least one page so pagination controls stay consistent.
      pagination: { ...pagination, totalPages: Math.max(1, pagination.totalPages || 0) },
    };
  } catch (err) {
    return rejectWithValue(extractError(err));
  }
});

export const fetchAnalytics = createAsyncThunk<
  AnalyticsData,
  void,
  { rejectValue: string }
>("user/fetchAnalytics", async (_, { rejectWithValue }) => {
  try {
    const res = await getRequest<{ success: boolean; analytics: AnalyticsData }>(
      "/user/analytics",
    );
    return res.analytics;
  } catch (err) {
    return rejectWithValue(extractError(err));
  }
});

export const addUser = createAsyncThunk<User, User, { rejectValue: string }>(
  "user/addUser",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await postRequest<{ user: User }, User>("/user", userData);
      return res.user;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const updateUser = createAsyncThunk<
  User,
  { id: string; userData: Partial<User> },
  { rejectValue: string }
>("user/updateUser", async ({ id, userData }, { rejectWithValue }) => {
  try {
    const res = await putRequest<
      { success: boolean; updatedUser?: User; message?: string },
      Partial<User>
    >(`/user/${encodeURIComponent(id)}`, userData);
    if (res.success && res.updatedUser) return res.updatedUser;
    return rejectWithValue(res.message || "Update failed");
  } catch (err) {
    return rejectWithValue(extractError(err));
  }
});

export const deleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  "user/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await deleteRequest(`/user/${encodeURIComponent(id)}`);
      return id;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch users";
      })

      .addCase(fetchAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload || "Failed to fetch analytics";
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map((user) =>
          user.userid === action.payload.userid ? action.payload : user,
        );
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.studentid !== action.payload);
      });

    // Shared "saving" flag for all mutations.
    builder
      .addMatcher(isPending(addUser, updateUser, deleteUser), (state) => {
        state.saving = true;
      })
      .addMatcher(
        isFulfilled(addUser, updateUser, deleteUser),
        (state) => {
          state.saving = false;
        },
      )
      .addMatcher(isRejected(addUser, updateUser, deleteUser), (state) => {
        state.saving = false;
      });
  },
});

export const { resetError } = userSlice.actions;
export default userSlice.reducer;
