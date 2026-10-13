import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCurrentUser } from "../features/auth/authSlice";

/** Restores the session (from the httpOnly cookie) once on app start. */
export default function useGetCurrentUser() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, status, loading, hasInitialized } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (!hasInitialized && status === "idle") {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, hasInitialized, status]);

  return {
    hasInitialized,
    loading: !hasInitialized || loading || status === "idle",
    isAuthenticated,
    status,
  };
}
