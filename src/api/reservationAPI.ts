import type {
  ReservationListDto,
  ReservationDetailDto,
  ReservationSearchDto,
  CreateReservationDto,
  UpdateReservationDto,
} from "../redux/features/reservation/reservationTypes";

import { getToken } from "../utils/token";

const API_BASE = "https://localhost:7124/api/reservation";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error in the request");
  }
  return response.json();
}

// AUTH HEADERS
function getAuthHeader() {
  const token = getToken();
  if (!token) throw new Error("Unauthenticated user");
  return { Authorization: `Bearer ${token}` };
}

function getOptionalAuthHeader(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export const getReservationById = async (id: string): Promise<ReservationDetailDto> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  return handleResponse<ReservationDetailDto>(response);
};

export const createReservation = async (dto: CreateReservationDto): Promise<ReservationDetailDto> => {
  const response = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getOptionalAuthHeader(),
    },
    body: JSON.stringify(dto),
  });

  return handleResponse<ReservationDetailDto>(response);
};

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
    throw new Error(errorData.error || "Error while deleting");
  }
};

// staff search
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
