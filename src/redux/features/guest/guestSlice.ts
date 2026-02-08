import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { GuestDto } from "./guestTypes";

import { createGuestAPI, updateGuestAPI, deleteGuestAPI } from "../../../api/guestAPI";

interface GuestState {
  loading: boolean;
  error: string | null;
}

const initialState: GuestState = {
  loading: false,
  error: null,
};

//Thunks
export const createGuest = createAsyncThunk<GuestDto, GuestDto, { rejectValue: string }>("guest/create", async (dto, { rejectWithValue }) => {
  try {
    return await createGuestAPI(dto);
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Errore create guest");
  }
});

export const updateGuest = createAsyncThunk<GuestDto, { id: string; dto: GuestDto }, { rejectValue: string }>(
  "guest/update",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      return await updateGuestAPI(id, dto);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Errore update guest");
    }
  },
);

export const deleteGuest = createAsyncThunk<string, string, { rejectValue: string }>("guest/delete", async (id, { rejectWithValue }) => {
  try {
    await deleteGuestAPI(id);
    return id;
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Errore delete guest");
  }
});

//Slice
const guestSlice = createSlice({
  name: "guest",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // CREATE
      .addCase(createGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGuest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Errore creazione guest";
      })

      // UPDATE
      .addCase(updateGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGuest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Errore update guest";
      })

      // DELETE
      .addCase(deleteGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGuest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Errore delete guest";
      });
  },
});

export default guestSlice.reducer;
