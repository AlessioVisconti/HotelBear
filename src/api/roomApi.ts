import type { RoomListDto, RoomDetailDto, CreateRoomDto, UpdateRoomDto } from "../redux/features/room/roomTypes";
import { getToken } from "../utils/token";

function getAuthHeader() {
  const token = getToken();
  if (!token) throw new Error("Unauthenticated user");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export const fetchRoomsAPI = async (): Promise<RoomListDto[]> => {
  const res = await fetch("https://localhost:7124/api/room");
  if (!res.ok) throw new Error("Camera fetch error");
  return res.json();
};

export const fetchRoomByIdAPI = async (id: string): Promise<RoomDetailDto> => {
  const res = await fetch(`https://localhost:7124/api/room/${id}`);
  if (!res.ok) throw new Error("Room detail error");
  return res.json();
};

export const createRoomAPI = async (dto: CreateRoomDto): Promise<RoomDetailDto> => {
  const res = await fetch("https://localhost:7124/api/room", {
    method: "POST",
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Room creation error: ${text}`);
  }

  return res.json();
};

export const updateRoomAPI = async (id: string, dto: UpdateRoomDto): Promise<RoomDetailDto> => {
  const payload: Partial<UpdateRoomDto> = Object.fromEntries(
    Object.entries(dto).filter(([, value]) => value !== null && value !== undefined && !(typeof value === "string" && value.trim() === "")),
  );

  const res = await fetch(`https://localhost:7124/api/room/${id}`, {
    method: "PUT",
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Camera update error: ${text}`);
  }

  return res.json();
};

export const deleteRoomAPI = async (id: string): Promise<void> => {
  const res = await fetch(`https://localhost:7124/api/room/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Delete camera error");
};

export const addRoomPhotoAPI = async (roomId: string, file: File, isCover: boolean): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("isCover", String(isCover));

  const res = await fetch(`https://localhost:7124/api/room/${roomId}/photos`, {
    method: "POST",
    headers: { ...getAuthHeader() },
    body: formData,
  });

  if (!res.ok) throw new Error("Photo upload error");
};

export const deleteRoomPhotoAPI = async (photoId: string): Promise<void> => {
  const res = await fetch(`https://localhost:7124/api/room/photos/${photoId}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });

  if (!res.ok) throw new Error("Delete photo error");
};

export const setRoomPhotoCoverAPI = async (photoId: string): Promise<void> => {
  const res = await fetch(`https://localhost:7124/api/room/photos/${photoId}/cover`, {
    method: "PATCH",
    headers: { ...getAuthHeader() },
  });

  if (!res.ok) throw new Error("Set cover error");
};

export const fetchAvailableRoomsAPI = async (checkIn: string, checkOut: string): Promise<RoomListDto[]> => {
  const res = await fetch(`https://localhost:7124/api/room/available?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch available rooms error: ${text}`);
  }

  return res.json();
};
