import type {
  ReservationListDto,
  ReservationDetailDto,
  ReservationSearchDto,
  CreateReservationDto,
  UpdateReservationDto,
} from "../redux/features/reservation/reservationTypes";
import { getToken } from "../utils/token";

const API_BASE = "https://localhost:7124/api/reservation";

// Funzione helper per fetch con gestione errori
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Errore nella richiesta");
  }
  return response.json();
}

// Recupera token dai cookie
function getAuthHeader() {
  const token = getToken();
  if (!token) throw new Error("Utente non autenticato");
  return { Authorization: `Bearer ${token}` };
}

// GET Reservation by ID
export const getReservationById = async (id: string): Promise<ReservationDetailDto> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return handleResponse<ReservationDetailDto>(response);
};

// POST Create Reservation
export const createReservation = async (dto: CreateReservationDto): Promise<ReservationDetailDto> => {
  const response = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(dto),
  });
  return handleResponse<ReservationDetailDto>(response);
};

// PUT Update Reservation
export const updateReservation = async (id: string, dto: UpdateReservationDto): Promise<ReservationDetailDto> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(dto),
  });
  return handleResponse<ReservationDetailDto>(response);
};

// DELETE (Soft Delete / Cancel) Reservation
export const cancelReservation = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Errore durante la cancellazione");
  }
};

// POST Search Reservations
export const searchReservations = async (dto: ReservationSearchDto): Promise<ReservationListDto[]> => {
  const response = await fetch(`${API_BASE}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(dto),
  });
  return handleResponse<ReservationListDto[]>(response);
};
