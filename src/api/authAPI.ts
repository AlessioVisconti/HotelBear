import type { LoginDto, AuthResponseDto, RegisterCustomerDto, CreateStaffUserDto, UserDto } from "../redux/features/auth/authTypes";

//Login
export const loginAPI = async (dto: LoginDto): Promise<AuthResponseDto> => {
  const response = await fetch("https://localhost:7124/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const errorData: { message?: string } = await response.json();
    throw new Error(errorData.message || "Error during login");
  }

  const data: AuthResponseDto = await response.json();
  return data;
};

//Register Customer
export const registerCustomerAPI = async (dto: RegisterCustomerDto): Promise<AuthResponseDto> => {
  const response = await fetch("https://localhost:7124/api/auth/register/customer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const errorData: { message?: string } = await response.json();
    throw new Error(errorData.message || "Error during customer registration");
  }

  const data: AuthResponseDto = await response.json();
  return data;
};

//Register Staff
export const registerStaffAPI = async (dto: CreateStaffUserDto, token: string): Promise<AuthResponseDto> => {
  const response = await fetch("https://localhost:7124/api/auth/register/staff", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const errorData: { message?: string } = await response.json();
    throw new Error(errorData.message || "Error during staff creation");
  }

  const data: AuthResponseDto = await response.json();
  return data;
};

// Get Staff
export const getAllStaffAPI = async (token: string): Promise<UserDto[]> => {
  const response = await fetch("https://localhost:7124/api/auth/staff", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error fetching staff list");
  }

  return await response.json();
};

// Deactivate Staff
export const deactivateStaffAPI = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`https://localhost:7124/api/auth/staff/${id}/deactivate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error deactivating staff");
  }
};

// Reactivate Staff
export const reactivateStaffAPI = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`https://localhost:7124/api/auth/staff/${id}/reactivate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error reactivating staff");
  }
};
