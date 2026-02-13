export interface AuthState {
  token: string | null;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  expiration: string | null;
  loading: boolean;
  error: string | null;
  staffList: UserDto[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterCustomerDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateStaffUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "Receptionist" | "RoomStaff";
}

export interface AuthResponseDto {
  token: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  expiration: string;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}
