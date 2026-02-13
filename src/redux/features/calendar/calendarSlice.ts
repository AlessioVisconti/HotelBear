import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RoomCalendarDto } from "./calendarTypes";
import { fetchRoomCalendar } from "../../../api/calendarAPI";

interface CalendarState {
  rooms: RoomCalendarDto[];
  loading: boolean;
  error: string | null;
}

const initialState: CalendarState = {
  rooms: [],
  loading: false,
  error: null,
};

export const getRoomCalendar = createAsyncThunk<RoomCalendarDto[], { startDate?: string; endDate?: string }>(
  "calendar/fetch",
  async (params, { rejectWithValue }) => {
    try {
      const data = await fetchRoomCalendar(params.startDate, params.endDate);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Unknown error");
    }
  },
);

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRoomCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoomCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(getRoomCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default calendarSlice.reducer;
