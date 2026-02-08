import type { RoomCalendarDto } from "../redux/features/calendar/calendarTypes";
import { getToken } from "../utils/token"; // getter dai cookie

// Helper per header con token
function getAuthHeader() {
  const token = getToken();
  if (!token) throw new Error("Utente non autenticato");
  return { Authorization: `Bearer ${token}` };
}

// Fetch calendario stanze
export const fetchRoomCalendar = async (startDate?: string, endDate?: string): Promise<RoomCalendarDto[]> => {
  const query = new URLSearchParams();
  if (startDate) query.append("startDate", startDate);
  if (endDate) query.append("endDate", endDate);

  const response = await fetch(`https://localhost:7124/api/room/calendar?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Errore nel fetch del calendario");
  }

  return response.json();
};
