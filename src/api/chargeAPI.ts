import type { ChargeDto } from "../redux/features/charge/chargeTypes";
import { getToken } from "../utils/token";

const API_BASE = "https://localhost:7124/api/charge";

function getAuthHeader(): HeadersInit {
  const token = getToken();
  if (!token) throw new Error("Unauthenticated user");
  return { Authorization: `Bearer ${token}` };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Charge request error");
  }
  return response.json();
}

export const createChargeAPI = async (dto: ChargeDto): Promise<ChargeDto> => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(dto),
  });
  return handleResponse<ChargeDto>(res);
};

export const updateChargeAPI = async (id: string, dto: ChargeDto): Promise<ChargeDto> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(dto),
  });
  return handleResponse<ChargeDto>(res);
};

export const deleteChargeAPI = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Charge deletion error");
  }
};
