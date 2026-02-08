import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, LoginDto, AuthResponseDto } from "./authTypes";
import { loginAPI } from "../../../api/authAPI";
import { setToken, removeToken, getToken, setRole, getRole, setExpiration, getExpiration } from "../../../utils/token";

const initialState: AuthState = {
  token: getToken(),
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  role: getRole() || "",
  expiration: getExpiration() || null,
  loading: false,
  error: null,
};

// Async thunk per login
export const login = createAsyncThunk<AuthResponseDto, LoginDto>("auth/login", async (dto, { rejectWithValue }) => {
  try {
    const response = await loginAPI(dto);
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) return rejectWithValue(err.message);
    return rejectWithValue("Errore durante il login");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.username = "";
      state.email = "";
      state.firstName = "";
      state.lastName = "";
      state.role = "";
      state.expiration = null;

      // Rimuovi cookie
      removeToken();
      setRole("");
      setExpiration(null);
    },
    setAuthFromToken(
      state,
      action: PayloadAction<{
        token: string;
        username?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        role?: string;
        expiration?: string | null;
      }>,
    ) {
      state.token = action.payload.token;
      state.username = action.payload.username || "";
      state.email = action.payload.email || "";
      state.firstName = action.payload.firstName || "";
      state.lastName = action.payload.lastName || "";
      state.role = action.payload.role || "";
      state.expiration = action.payload.expiration || null;

      // Salva nei cookie
      const expirationMinutes = action.payload.expiration
        ? Math.ceil((new Date(action.payload.expiration).getTime() - new Date().getTime()) / 60000)
        : undefined;
      setToken(action.payload.token, expirationMinutes);
      setRole(action.payload.role || "");
      setExpiration(action.payload.expiration || null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponseDto>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.firstName = action.payload.firstName;
        state.lastName = action.payload.lastName;
        state.role = action.payload.role;
        state.expiration = action.payload.expiration;

        // Salva tutto nei cookie
        const expirationMinutes = Math.ceil((new Date(action.payload.expiration).getTime() - new Date().getTime()) / 60000);
        setToken(action.payload.token, expirationMinutes);
        setRole(action.payload.role);
        setExpiration(action.payload.expiration);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setAuthFromToken } = authSlice.actions;
export default authSlice.reducer;
