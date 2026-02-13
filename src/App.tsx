import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./redux/store";

import LoginPage from "./pages/LoginPage";
import CalendarPage from "./pages/CalendarPage";
import DashboardPage from "./pages/DashboardPage";

import PrivateRoute from "./components/PrivateRoute";
import MainNavbar from "./components/MainNavbar";
import RoomsPage from "./pages/RoomsPage";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import StaffPage from "./pages/StaffPage";
import RegisterCustomerPage from "./pages/RegisterCustomerPage";
import RoomDetailsCustomer from "./pages/RoomDetailsCustomer";

const App: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!token;

  return (
    <>
      <MainNavbar />

      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<DashboardPage />} />
        {/* RoomDetails Customer Front */}
        <Route path="/roomdetails/:id" element={<RoomDetailsCustomer />} />

        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />

        {/* CalendarPage */}
        <Route
          path="/calendar"
          element={
            <PrivateRoute allowedRoles={["Admin", "Receptionist", "RoomStaff"]}>
              <CalendarPage />
            </PrivateRoute>
          }
        />

        {/* RoomsPage */}
        <Route
          path="/rooms"
          element={
            <PrivateRoute allowedRoles={["Admin"]}>
              <RoomsPage />
            </PrivateRoute>
          }
        />
        {/* PaymentMethodsPage */}
        <Route
          path="/payment-methods"
          element={
            <PrivateRoute allowedRoles={["Admin"]}>
              <PaymentMethodsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <PrivateRoute allowedRoles={["Admin"]}>
              <StaffPage />
            </PrivateRoute>
          }
        />

        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterCustomerPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
