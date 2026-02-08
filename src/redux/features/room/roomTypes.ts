export interface RoomPhotoDto {
  id: string;
  url: string;
  isCover: boolean;
}

export interface RoomListDto {
  id: string;
  roomNumber: string;
  roomName: string;
  description?: string;
  beds: number;
  bedsTypes: string;
  priceForNight: number;
  coverPhotoUrl?: string | null;
}

export interface RoomDetailDto {
  id: string;
  roomNumber: string;
  roomName: string;
  description?: string;
  beds: number;
  bedsTypes: string;
  priceForNight: number;
  photos: RoomPhotoDto[];
}

export interface CreateRoomDto {
  roomNumber: string;
  roomName: string;
  description: string;
  beds: number;
  bedsTypes: string;
  priceForNight: number;
}

export interface UpdateRoomDto {
  roomNumber?: string;
  roomName?: string;
  description?: string;
  beds?: number;
  bedsTypes?: string;
  priceForNight?: number;
}

export interface RoomState {
  list: RoomListDto[];
  selected: RoomDetailDto | null;
  loadingList: boolean;
  loadingDetail: boolean;
  loadingCrud: boolean;
  error: string | null;
}
