import { authSlice } from "../reducers/authReducer";
import type { AppDispatch } from "../store/store";
import type { AuthResponse, RegisterCustomerDto, LoginDto } from "../types/authTypes";

export const login = (dto: LoginDto) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.loginRequest());
  try {
    const res = await fetch("https://localhost:7124/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!res.ok) throw new Error("Invalid credentials or account deactivated");

    const data: AuthResponse = await res.json();
    localStorage.setItem("token", data.token);

    dispatch(authSlice.actions.loginSuccess(data));
  } catch (err) {
    dispatch(authSlice.actions.loginFailure((err as Error).message));
  }
};

// Logout
export const performLogout = () => (dispatch: AppDispatch) => {
  localStorage.removeItem("token");
  dispatch(authSlice.actions.logout());
};

// Registrazione cliente
export const registerCustomer = (dto: RegisterCustomerDto) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.loginRequest()); // puoi riutilizzare loading/error
  try {
    const res = await fetch("https://localhost:7124/api/auth/register/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Registration error");
    }

    const data: AuthResponse = await res.json();
    localStorage.setItem("token", data.token);

    dispatch(authSlice.actions.loginSuccess(data));
  } catch (err) {
    dispatch(authSlice.actions.loginFailure((err as Error).message));
  }
};
