import type { RoomListDto, RoomDetailDto, CreateRoomDto, UpdateRoomDto } from "../redux/features/room/roomTypes";
import { getToken } from "../utils/token";

// Header Auth helper
function getAuthHeader() {
  const token = getToken();
  if (!token) throw new Error("Utente non autenticato");

  return {
    Authorization: `Bearer ${token}`,
  };
}

// GET ALL ROOMS
export const fetchRoomsAPI = async (): Promise<RoomListDto[]> => {
  const res = await fetch("https://localhost:7124/api/room");
  if (!res.ok) throw new Error("Errore fetch camere");
  return res.json();
};

// GET ROOM DETAIL
export const fetchRoomByIdAPI = async (id: string): Promise<RoomDetailDto> => {
  const res = await fetch(`https://localhost:7124/api/room/${id}`);
  if (!res.ok) throw new Error("Errore dettaglio camera");
  return res.json();
};

// CREATE ROOM (Admin)
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
    throw new Error(`Errore creazione camera: ${text}`);
  }

  return res.json();
};

// UPDATE ROOM (Admin)
export const updateRoomAPI = async (id: string, dto: UpdateRoomDto): Promise<RoomDetailDto> => {
  // ✅ rimuove campi null, undefined o stringhe vuote per evitare errori 500
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
    throw new Error(`Errore update camera: ${text}`);
  }

  return res.json();
};

// DELETE ROOM
export const deleteRoomAPI = async (id: string): Promise<void> => {
  const res = await fetch(`https://localhost:7124/api/room/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) throw new Error("Errore delete camera");
};

// ADD PHOTO
export const addRoomPhotoAPI = async (roomId: string, file: File, isCover: boolean): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("isCover", String(isCover));

  const res = await fetch(`https://localhost:7124/api/room/${roomId}/photos`, {
    method: "POST",
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Errore upload foto");
};

// DELETE PHOTO
export const deleteRoomPhotoAPI = async (photoId: string): Promise<void> => {
  const res = await fetch(`https://localhost:7124/api/room/photos/${photoId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) throw new Error("Errore delete foto");
};

// SET COVER PHOTO
export const setRoomPhotoCoverAPI = async (photoId: string): Promise<void> => {
  const res = await fetch(`https://localhost:7124/api/room/photos/${photoId}/cover`, {
    method: "PATCH",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) throw new Error("Errore set cover");
};
