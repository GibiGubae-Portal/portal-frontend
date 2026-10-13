import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Admin } from "../../types";
import { extractError } from "../../util/utils";
import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
} from "../../api/api";
import Swal from "sweetalert2";

interface AdminState {
  admins: Admin[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  admins: [],
  loading: false,
  error: null,
};

interface AsyncThunkConfig {
  rejectValue: string;
}

const showSuccess = (msg: string) =>
  Swal.fire({
    icon: "success",
    title: "Operation Successful",
    text: msg,
  });

const showError = (title: string, msg: string) =>
  Swal.fire({
    icon: "error",
    title,
    text: msg,
  });

// ✅ Fetch Admins
export const fetchAdmins = createAsyncThunk<Admin[], void, AsyncThunkConfig>(
  "admin/fetchAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getRequest<{
        success: boolean;
        message: string;
        admins?: Admin[];
      }>("/admin");

      if (res.success && Array.isArray(res.admins)) {
        return res.admins;
      }
      return rejectWithValue(res.message || "Failed to fetch admins");
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

// ✅ Add Admin
export const addAdmin = createAsyncThunk<
  void,
  Partial<Admin>,
  AsyncThunkConfig
>("admin/addAdmin", async (adminData, { rejectWithValue, dispatch }) => {
  try {
    const res = await postRequest<
      { success: boolean; message: string; admin?: Admin },
      Partial<Admin>
    >("/admin", adminData);

    if (res.success) {
      await showSuccess("Admin added successfully");
      await dispatch(fetchAdmins());
      return;
    }
    return rejectWithValue(res.message || "Failed to add admin");
  } catch (err) {
    const message = extractError(err);
    await showError("Failed to add admin", message);
    return rejectWithValue(message);
  }
});

// ✅ Update Admin
export const updateAdmin = createAsyncThunk<
  void,
  { id: string; adminData: Partial<Admin> },
  AsyncThunkConfig
>(
  "admin/updateAdmin",
  async ({ id, adminData }, { rejectWithValue, dispatch }) => {
    try {
      const res = await putRequest<
        { success: boolean; message?: string },
        Partial<Admin>
      >(`/admin/${encodeURIComponent(id)}`, adminData);

      if (res.success) {
        await showSuccess("Admin updated successfully");
        await dispatch(fetchAdmins());
        return;
      }
      return rejectWithValue(res.message || "Can't edit admin");
    } catch (err) {
      const message = extractError(err);
      await showError("Failed to update admin", message);
      return rejectWithValue(message);
    }
  }
);

// ✅ Delete Admin
export const deleteAdmin = createAsyncThunk<void, string, AsyncThunkConfig>(
  "admin/deleteAdmin",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const res = await deleteRequest<{ success: boolean; message?: string }>(
        `/admin/${encodeURIComponent(id)}`
      );

      if (res.success) {
        await showSuccess("Admin deleted successfully");
        await dispatch(fetchAdmins());
        return;
      }
      return rejectWithValue(res.message || "Failed to delete admin");
    } catch (err) {
      const message = extractError(err);
      await showError("Failed to delete admin", message);
      return rejectWithValue(message);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAdmins.fulfilled,
        (state, action: PayloadAction<Admin[]>) => {
          state.loading = false;
          state.admins = action.payload;
        }
      )
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch admins";
      })

      .addCase(addAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAdmin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add admin";
      })

      // UPDATE
      .addCase(updateAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update admin";
      })

      // DELETE
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete admin";
      });
  },
});

export default adminSlice.reducer;
