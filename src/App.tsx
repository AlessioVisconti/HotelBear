import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./redux/store";

import LoginPage from "./pages/LoginPage";
import CalendarPage from "./pages/CalendarPage";
import DashboardPage from "./pages/DashboardPage";

import PrivateRoute from "./components/PrivateRoute";
import MainNavbar from "./components/MainNavbar";
import RoomsPage from "./pages/RoomsPage";

const App: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!token;

  return (
    <>
      <MainNavbar />

      <Routes>
        {/* Dashboard pubblica */}
        <Route path="/" element={<DashboardPage />} />

        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />

        {/* CalendarPage protetta: solo staff/admin */}
        <Route
          path="/calendar"
          element={
            <PrivateRoute allowedRoles={["Admin", "Receptionist", "RoomStaff"]}>
              <CalendarPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <PrivateRoute allowedRoles={["Admin"]}>
              <RoomsPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
