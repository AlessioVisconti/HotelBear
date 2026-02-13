import type { GuestDto } from "../redux/features/guest/guestTypes";
import { getToken } from "../utils/token";

const API_BASE = "https://localhost:7124/api/guest";

function getAuthHeader(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}
// Create
export async function createGuestAPI(dto: GuestDto): Promise<GuestDto> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) throw new Error("Guest creation error");

  return res.json();
}

// Update
export async function updateGuestAPI(id: string, dto: GuestDto): Promise<GuestDto> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) throw new Error("Error updating guest");

  return res.json();
}

// Delete
export async function deleteGuestAPI(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) throw new Error("Delete guest error");
}
