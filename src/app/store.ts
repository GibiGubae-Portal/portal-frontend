import { configureStore } from "@reduxjs/toolkit";
import { setUnauthorizedHandler } from "../api/api";
import adminReducer from "../features/admins/adminsSlice";
import userReducer from "../features/users/userSlice";
import authReducer, { sessionExpired } from "../features/auth/authSlice";
import rolesReducer from "../features/roles/rolesSlice";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    user: userReducer,
    auth: authReducer,
    roles: rolesReducer,
  },
  devTools: import.meta.env.DEV,
});

// Any 401 from a protected endpoint means the session is gone: drop the
// local session so <ProtectedRoute> sends the user back to the login page.
setUnauthorizedHandler(() => {
  if (store.getState().auth.isAuthenticated) {
    store.dispatch(sessionExpired());
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
