export interface ReservationBarDto {
  reservationId: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "CheckedIn" | "CheckedOut";
  startsBeforeRange: boolean;
  endsAfterRange: boolean;
}

export interface RoomCalendarDto {
  roomId: string;
  roomNumber: string;
  roomName: string;
  roomPrice: number;
  reservations: ReservationBarDto[];
}
