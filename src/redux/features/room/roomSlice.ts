import { createSlice, createAsyncThunk, isPending, isFulfilled, isRejected } from "@reduxjs/toolkit";
import type { RoomState, RoomListDto, RoomDetailDto, CreateRoomDto, UpdateRoomDto, RoomDayClickResultDto } from "./roomTypes";

import {
  fetchRoomsAPI,
  fetchRoomByIdAPI,
  createRoomAPI,
  updateRoomAPI,
  deleteRoomAPI,
  addRoomPhotoAPI,
  deleteRoomPhotoAPI,
  setRoomPhotoCoverAPI,
  fetchAvailableRoomsAPI,
} from "../../../api/roomApi";
import type { AppDispatch } from "../../store";

// Aggiornamento tipi
interface RoomStateWithCheck extends RoomState {
  roomDayCheck: RoomDayClickResultDto | null;
  loadingCheck: boolean;
  availableRooms: RoomListDto[];
  loadingAvailable: boolean;
}

// initialState
const initialState: RoomStateWithCheck = {
  list: [],
  selected: null,
  loadingList: false,
  loadingDetail: false,
  loadingCrud: false,
  error: null,
  roomDayCheck: null,
  loadingCheck: false,
  availableRooms: [],
  loadingAvailable: false,
};

// Thunks
export const fetchRooms = createAsyncThunk<RoomListDto[], void, { rejectValue: string }>("room/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await fetchRoomsAPI();
  } catch (err: unknown) {
    return err instanceof Error ? rejectWithValue(err.message) : rejectWithValue("Errore fetch rooms");
  }
});

export const fetchRoomById = createAsyncThunk<RoomDetailDto, string, { rejectValue: string }>("room/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await fetchRoomByIdAPI(id);
  } catch (err: unknown) {
    return err instanceof Error ? rejectWithValue(err.message) : rejectWithValue("Errore fetch detail");
  }
});

export const createRoom = createAsyncThunk<RoomDetailDto, CreateRoomDto, { rejectValue: string; dispatch: AppDispatch }>(
  "room/create",
  async (dto, { rejectWithValue, dispatch }) => {
    try {
      const created = await createRoomAPI(dto);
      await dispatch(fetchRooms());
      return created;
    } catch (err: unknown) {
      return err instanceof Error ? rejectWithValue(err.message) : rejectWithValue("Create room error");
    }
  },
);

export const updateRoom = createAsyncThunk<void, { id: string; dto: UpdateRoomDto }, { rejectValue: string; dispatch: AppDispatch }>(
  "room/update",
  async ({ id, dto }, { rejectWithValue, dispatch }) => {
    try {
      if (dto.roomNumber?.trim() === "" || dto.roomName?.trim() === "") {
        return rejectWithValue("Room number and name are required");
      }

      await updateRoomAPI(id, dto);
      await dispatch(fetchRooms());
      await dispatch(fetchRoomById(id));
    } catch (err: unknown) {
      return err instanceof Error ? rejectWithValue(err.message) : rejectWithValue("Update room error");
    }
  },
);

export const deleteRoom = createAsyncThunk<void, string, { rejectValue: string; dispatch: AppDispatch }>(
  "room/delete",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await deleteRoomAPI(id);
      await dispatch(fetchRooms());
    } catch (err: unknown) {
      return err instanceof Error ? rejectWithValue(err.message) : rejectWithValue("Delete room error");
    }
  },
);

export const addRoomPhoto = createAsyncThunk<
  void,
  { roomId: string; file: File; isCover: boolean; currentPhotosCount: number },
  { rejectValue: string; dispatch: AppDispatch }
>("room/addPhoto", async (data, { rejectWithValue, dispatch }) => {
  try {
    if (data.currentPhotosCount >= 3) throw new Error("Maximum limit of 3 photos per room reached");
    await addRoomPhotoAPI(data.roomId, data.file, data.isCover);
    await dispatch(fetchRoomById(data.roomId));
  } catch (err: unknown) {
    return err instanceof Error ? rejectWithValue(err.message) : rejectWithValue("Photo upload error");
  }
});

export const deleteRoomPhoto = createAsyncThunk<void, { photoId: string; roomId: string }, { rejectValue: string; dispatch: AppDispatch }>(
  "room/deletePhoto",
  async ({ photoId, roomId }, { rejectWithValue, dispatch }) => {
    try {
      await deleteRoomPhotoAPI(photoId);
      await dispatch(fetchRoomById(roomId));
    } catch (err: unknown) {
      return err instanceof Error ? rejectWithValue(err.message) : rejectWithValue("Delete photo error");
    }
  },
);

export const setRoomPhotoCover = createAsyncThunk<void, { photoId: string; roomId: string }, { rejectValue: string; dispatch: AppDispatch }>(
  "room/setCover",
  async ({ photoId, roomId }, { rejectWithValue, dispatch }) => {
    try {
      await setRoomPhotoCoverAPI(photoId);
      await dispatch(fetchRoomById(roomId));
    } catch (err: unknown) {
      return err instanceof Error ? rejectWithValue(err.message) : rejectWithValue("Set cover error");
    }
  },
);

// Nuovo thunk tipizzato
export const fetchAvailableRooms = createAsyncThunk<RoomListDto[], { checkIn: string; checkOut: string }, { rejectValue: string }>(
  "room/fetchAvailableRooms",
  async ({ checkIn, checkOut }, { rejectWithValue }) => {
    try {
      return await fetchAvailableRoomsAPI(checkIn, checkOut);
    } catch (err: unknown) {
      return err instanceof Error ? rejectWithValue(err.message) : rejectWithValue("Fetch available rooms error");
    }
  },
);

// Slice
const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    clearSelectedRoom(state) {
      state.selected = null;
    },
    clearRoomError(state) {
      state.error = null;
    },
    clearRoomDayCheck(state) {
      state.roomDayCheck = null;
      state.loadingCheck = false;
    },
    clearAvailableRooms(state) {
      state.availableRooms = [];
      state.loadingAvailable = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRooms
      .addCase(fetchRooms.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loadingList = false;
        state.list = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.payload ?? "Error loading list";
      })

      // fetchRoomById
      .addCase(fetchRoomById.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selected = action.payload;
      })
      .addCase(fetchRoomById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload ?? "Detail loading error";
      })

      // fetchAvailableRooms
      .addCase(fetchAvailableRooms.pending, (state) => {
        state.loadingAvailable = true;
        state.error = null;
        state.availableRooms = [];
      })
      .addCase(fetchAvailableRooms.fulfilled, (state, action) => {
        state.loadingAvailable = false;
        state.availableRooms = action.payload;
      })
      .addCase(fetchAvailableRooms.rejected, (state, action) => {
        state.loadingAvailable = false;
        state.error = action.payload ?? "Check avilable rooms error";
      })
      // CRUD & photo matchers
      .addMatcher(isPending(createRoom, updateRoom, deleteRoom, addRoomPhoto, deleteRoomPhoto, setRoomPhotoCover), (state) => {
        state.loadingCrud = true;
        state.error = null;
      })
      .addMatcher(isFulfilled(createRoom, updateRoom, deleteRoom, addRoomPhoto, deleteRoomPhoto, setRoomPhotoCover), (state) => {
        state.loadingCrud = false;
      })
      .addMatcher(isRejected(createRoom, updateRoom, deleteRoom, addRoomPhoto, deleteRoomPhoto, setRoomPhotoCover), (state, action) => {
        state.loadingCrud = false;
        state.error = action.payload ?? "Operation error";
      });
  },
});

export const { clearSelectedRoom, clearRoomError, clearRoomDayCheck } = roomSlice.actions;
export default roomSlice.reducer;
