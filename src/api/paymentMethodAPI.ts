import type { PaymentMethodDto, CreatePaymentMethodDto, UpdatePaymentMethodDto } from "../redux/features/paymentMethod/paymentMethodTypes";
import { getToken } from "../utils/token";

const API_URL = "https://localhost:7124/api/PaymentMethod";

function getAuthHeader(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const paymentMethodApi = {
  async getAll(includeInactive = false): Promise<PaymentMethodDto[]> {
    const res = await fetch(`${API_URL}?includeInactive=${includeInactive}`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!res.ok) throw new Error("Error loading payment methods");

    return res.json();
  },

  async create(dto: CreatePaymentMethodDto): Promise<PaymentMethodDto> {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) throw new Error("Payment method creation error");

    return res.json();
  },

  async update(id: string, dto: UpdatePaymentMethodDto): Promise<PaymentMethodDto> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) throw new Error("Payment method update error");

    return res.json();
  },

  async deactivate(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!res.ok) throw new Error("Payment method deactivation error");
  },
};
