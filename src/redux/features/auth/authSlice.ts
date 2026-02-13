import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, LoginDto, AuthResponseDto, RegisterCustomerDto, CreateStaffUserDto, UserDto } from "./authTypes";
import { loginAPI, registerCustomerAPI, registerStaffAPI, getAllStaffAPI, deactivateStaffAPI, reactivateStaffAPI } from "../../../api/authAPI";
import { setToken, removeToken, getToken, setRole, getRole, setExpiration, getExpiration } from "../../../utils/token";

// Decode JWT
function parseJwt(token: string) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Initial state
const initialState: AuthState = {
  token: getToken(),
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  role: getRole() || "",
  expiration: getExpiration() || null,
  staffList: [],
  loading: false,
  error: null,
};

// Login
export const login = createAsyncThunk<AuthResponseDto, LoginDto>("auth/login", async (dto, { rejectWithValue }) => {
  try {
    return await loginAPI(dto);
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

// Register Customer
export const registerCustomer = createAsyncThunk<AuthResponseDto, RegisterCustomerDto>("auth/registerCustomer", async (dto, { rejectWithValue }) => {
  try {
    return await registerCustomerAPI(dto);
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

// Register Staff
export const registerStaff = createAsyncThunk<AuthResponseDto, CreateStaffUserDto, { state: { auth: AuthState } }>(
  "auth/registerStaff",
  async (dto, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("Missing admin token");
      return await registerStaffAPI(dto, token);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// Get Staff List
export const getAllStaff = createAsyncThunk<UserDto[], void, { state: { auth: AuthState } }>("auth/getAllStaff", async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Missing admin token");
    return await getAllStaffAPI(token);
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

// Deactivate Staff
export const deactivateStaff = createAsyncThunk<string, string, { state: { auth: AuthState } }>(
  "auth/deactivateStaff",
  async (staffId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("Missing admin token");
      await deactivateStaffAPI(staffId, token);
      return staffId;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// Reactivate Staff
export const reactivateStaff = createAsyncThunk<string, string, { state: { auth: AuthState } }>(
  "auth/reactivateStaff",
  async (staffId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("Missing admin token");
      await reactivateStaffAPI(staffId, token);
      return staffId;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

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
      state.staffList = [];

      removeToken();
      setRole("");
      setExpiration(null);
    },

    // Set auth from token (AppWrapper)
    setAuthFromToken(state, action: PayloadAction<{ token: string; expiration?: string | null }>) {
      state.token = action.payload.token;

      const decoded = parseJwt(action.payload.token);
      if (decoded) {
        const fullName = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "";
        const [firstName, ...lastNameParts] = fullName.split(" ");
        state.firstName = firstName || "";
        state.lastName = lastNameParts.join(" ") || "";
        state.email = decoded["email"] || "";
        state.role = decoded["role"] || "";
      }

      state.expiration = action.payload.expiration || null;

      setToken(action.payload.token);
      setRole(state.role);
      setExpiration(state.expiration);
    },
  },

  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.expiration = action.payload.expiration;

        const decoded = parseJwt(action.payload.token);
        if (decoded) {
          const fullName = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "";
          const [firstName, ...lastNameParts] = fullName.split(" ");
          state.firstName = firstName || "";
          state.lastName = lastNameParts.join(" ") || "";
          state.email = decoded["email"] || "";
          state.role = decoded["role"] || "";
        }

        setToken(action.payload.token);
        setRole(state.role);
        setExpiration(state.expiration);
      })

      // Get staff
      .addCase(getAllStaff.fulfilled, (state, action) => {
        state.staffList = action.payload;
      })

      // Deactivate
      .addCase(deactivateStaff.fulfilled, (state, action) => {
        const staff = state.staffList.find((u) => u.id === action.payload);
        if (staff) staff.isActive = false;
      })

      // Reactivate
      .addCase(reactivateStaff.fulfilled, (state, action) => {
        const staff = state.staffList.find((u) => u.id === action.payload);
        if (staff) staff.isActive = true;
      });
  },
});

export const { logout, setAuthFromToken } = authSlice.actions;
export default authSlice.reducer;
