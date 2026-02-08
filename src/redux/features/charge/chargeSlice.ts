import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { ChargeState, ChargeDto } from "./chargeTypes";
import { createChargeAPI, updateChargeAPI, deleteChargeAPI } from "../../../api/chargeAPI";

const initialState: ChargeState = {
  charges: [],
  loading: false,
  error: null,
};

export const createCharge = createAsyncThunk<ChargeDto, ChargeDto>("charge/create", async (dto, { rejectWithValue }) => {
  try {
    return await createChargeAPI(dto);
  } catch (err: unknown) {
    if (err instanceof Error) return rejectWithValue(err.message);
    return rejectWithValue("Errore creazione Charge");
  }
});

export const updateCharge = createAsyncThunk<ChargeDto, { id: string; dto: ChargeDto }>("charge/update", async ({ id, dto }, { rejectWithValue }) => {
  try {
    return await updateChargeAPI(id, dto);
  } catch (err: unknown) {
    if (err instanceof Error) return rejectWithValue(err.message);
    return rejectWithValue("Errore aggiornamento Charge");
  }
});

export const deleteCharge = createAsyncThunk<string, string>("charge/delete", async (id, { rejectWithValue }) => {
  try {
    await deleteChargeAPI(id);
    return id;
  } catch (err: unknown) {
    if (err instanceof Error) return rejectWithValue(err.message);
    return rejectWithValue("Errore eliminazione Charge");
  }
});

export const chargeSlice = createSlice({
  name: "charge",
  initialState,
  reducers: {
    clearCharges(state) {
      state.charges = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCharge.fulfilled, (state, action: PayloadAction<ChargeDto>) => {
        state.loading = false;
        state.charges.push(action.payload);
      })
      .addCase(createCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCharge.fulfilled, (state, action: PayloadAction<ChargeDto>) => {
        state.loading = false;
        const idx = state.charges.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.charges[idx] = action.payload;
      })
      .addCase(updateCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCharge.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.charges = state.charges.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCharges } = chargeSlice.actions;
export default chargeSlice.reducer;
