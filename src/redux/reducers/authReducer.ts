import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface LoginResponse {
  token: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  expiration: string;
}

interface AuthState {
  loading: boolean;
  isAuthenticated: boolean;
  token?: string;
  user?: LoginResponse;
  error?: string;
}

const initialState: AuthState = {
  loading: false,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest(state) {
      state.loading = true;
      state.error = undefined;
    },
    loginSuccess(state, action: PayloadAction<LoginResponse>) {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    logout(state) {
      state.loading = false;
      state.isAuthenticated = false;
      state.token = undefined;
      state.user = undefined;
      state.error = undefined;
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure, logout } = authSlice.actions;
export { authSlice };
export default authSlice.reducer;
