import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import calendarReducer from "./features/calendar/calendarSlice";
import reservationReducer from "./features/reservation/reservationSlice";
import roomReducer from "./features/room/roomSlice";
import guestReducer from "./features/guest/guestSlice";
import chargeReducer from "./features/charge/chargeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    calendar: calendarReducer,
    reservation: reservationReducer,
    room: roomReducer,
    guest: guestReducer,
    charge: chargeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
