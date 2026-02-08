import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { ReservationListDto, ReservationDetailDto, ReservationSearchDto, CreateReservationDto, UpdateReservationDto } from "./reservationTypes";
import { getReservationById, createReservation, updateReservation, cancelReservation, searchReservations } from "../../../api/reservationAPI";

interface ReservationState {
  reservationList: ReservationListDto[];
  currentReservation: ReservationDetailDto | null;
  loading: boolean;
  error: string | null;
  isSearching: boolean;
}

const initialState: ReservationState = {
  reservationList: [],
  currentReservation: null,
  loading: false,
  error: null,
  isSearching: false,
};

// THUNKS
export const fetchReservationById = createAsyncThunk<ReservationDetailDto, string, { rejectValue: string }>(
  "reservation/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getReservationById(id);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Errore sconosciuto");
    }
  },
);

export const createNewReservation = createAsyncThunk<ReservationDetailDto, CreateReservationDto, { rejectValue: string }>(
  "reservation/create",
  async (dto, { rejectWithValue }) => {
    try {
      return await createReservation(dto);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Errore sconosciuto");
    }
  },
);

export const updateExistingReservation = createAsyncThunk<ReservationDetailDto, { id: string; dto: UpdateReservationDto }, { rejectValue: string }>(
  "reservation/update",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      return await updateReservation(id, dto);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Errore sconosciuto");
    }
  },
);

export const cancelExistingReservation = createAsyncThunk<string, string, { rejectValue: string }>("reservation/cancel", async (id, { rejectWithValue }) => {
  try {
    await cancelReservation(id);
    return id;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Errore sconosciuto");
  }
});

export const searchReservationList = createAsyncThunk<ReservationListDto[], ReservationSearchDto, { rejectValue: string }>(
  "reservation/search",
  async (dto, { rejectWithValue }) => {
    try {
      return await searchReservations(dto);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Errore sconosciuto");
    }
  },
);

// SLICE
const reservationSlice = createSlice({
  name: "reservation",
  initialState,
  reducers: {
    clearCurrentReservation(state) {
      state.currentReservation = null;
      state.error = null;
    },
    clearSearch(state) {
      state.isSearching = false;
      state.reservationList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchReservationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReservationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReservation = action.payload;
      })
      .addCase(fetchReservationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // CREATE
      .addCase(createNewReservation.fulfilled, (state, action) => {
        state.currentReservation = action.payload;
      })

      // CANCEL
      .addCase(cancelExistingReservation.fulfilled, (state, action) => {
        state.reservationList = state.reservationList.filter((r) => r.id !== action.payload);
      })

      // SEARCH
      .addCase(searchReservationList.pending, (state) => {
        state.loading = true;
        state.isSearching = true;
      })
      .addCase(searchReservationList.fulfilled, (state, action) => {
        state.loading = false;
        state.reservationList = action.payload;
        state.isSearching = true;
      })
      .addCase(searchReservationList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      });
  },
});

export const { clearCurrentReservation, clearSearch } = reservationSlice.actions;
export default reservationSlice.reducer;
