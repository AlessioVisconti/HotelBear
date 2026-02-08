import type { LoginDto, AuthResponseDto } from "../redux/features/auth/authTypes";

export const loginAPI = async (dto: LoginDto): Promise<AuthResponseDto> => {
  const response = await fetch("https://localhost:7124/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Errore durante il login");
  }

  const data: AuthResponseDto = await response.json();
  return data;
};
