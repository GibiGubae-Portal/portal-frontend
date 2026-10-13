import { Suspense, lazy } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import LoadingScreen from "./components/ui/LoadingScreen";
import RouteError from "./components/ui/RouteError";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedAdminsPage from "./components/auth/protectedAdminsPage";
import useGetCurrentUser from "./customhook/useGetCurrentUser";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const ManageRoles = lazy(() => import("./pages/admin/ManageRoles"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const SuperAdmin = lazy(() => import("./pages/superAdmin/SuperAdminPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RootLayout = () => (
  <Suspense fallback={<LoadingScreen />}>
    <Outlet />
  </Suspense>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/admin/login", element: <AdminLogin /> },
      {
        path: "/admin",
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
        errorElement: <RouteError />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "users", element: <ManageUsers /> },
          { path: "analytics", element: <Analytics /> },
          {
            path: "manageRoles",
            element: (
              <ProtectedAdminsPage>
                <ManageRoles />
              </ProtectedAdminsPage>
            ),
          },
          {
            path: "superadmin",
            element: (
              <ProtectedAdminsPage>
                <SuperAdmin />
              </ProtectedAdminsPage>
            ),
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  // Restore the session in the background; protected routes wait for it,
  // public pages render immediately.
  useGetCurrentUser();
  return <RouterProvider router={router} />;
}

export default App;
