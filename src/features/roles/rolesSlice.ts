import { createAsyncThunk, createSlice, isPending, isRejected } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import { api, getErrorMessage } from "../../api/api";
import { Role } from "../../types";

export interface RolesState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  loading: false,
  error: null,
};

type RoleResponse<T> = { success: boolean; data: T; message?: string };
type ThunkConfig = { rejectValue: string };

const notifySuccess = (title: string) =>
  Swal.fire({ icon: "success", title, timer: 1500, showConfirmButton: false });

const notifyFailure = (title: string, message: string) =>
  Swal.fire({ icon: "error", title, text: message });

export const fetchRoles = createAsyncThunk<Role[], void, ThunkConfig>(
  "roles/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<RoleResponse<Role[]>>("/role");
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch roles"));
    }
  },
);

export const addRole = createAsyncThunk<Role, Partial<Role>, ThunkConfig>(
  "roles/addRole",
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await api.post<RoleResponse<Role>>("/role", roleData);
      notifySuccess("Role created");
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error, "Failed to add role");
      notifyFailure("Failed to add role", message);
      return rejectWithValue(message);
    }
  },
);

export const updateRole = createAsyncThunk<
  Role,
  { id: number; roleData: Partial<Role> },
  ThunkConfig
>("roles/updateRole", async ({ id, roleData }, { rejectWithValue }) => {
  try {
    // The API rejects the id field in the body; only send editable fields.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _ignored, ...changes } = roleData;
    const response = await api.put<RoleResponse<Role>>(`/role/${id}`, changes);
    notifySuccess("Role updated");
    return response.data.data;
  } catch (error) {
    const message = getErrorMessage(error, "Failed to update role");
    notifyFailure("Failed to update role", message);
    return rejectWithValue(message);
  }
});

export const deleteRole = createAsyncThunk<number, number, ThunkConfig>(
  "roles/deleteRole",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/role/${id}`);
      notifySuccess("Role deleted");
      return id;
    } catch (error) {
      const message = getErrorMessage(error, "Failed to delete role");
      notifyFailure("Failed to delete role", message);
      return rejectWithValue(message);
    }
  },
);

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    clearRolesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(addRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.push(action.payload);
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.roles.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.roles[index] = action.payload;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = state.roles.filter((r) => r.id !== action.payload);
      })
      .addMatcher(isPending(fetchRoles, addRole, updateRole, deleteRole), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isRejected(fetchRoles, addRole, updateRole, deleteRole), (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Request failed";
      });
  },
});

export const { clearRolesError } = rolesSlice.actions;
export default rolesSlice.reducer;
