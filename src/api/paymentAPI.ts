import type { PaymentDto, CreatePaymentDto, UpdatePaymentDto } from "../redux/features/payment/paymentTypes";
import { getToken } from "../utils/token";

const API_URL = "https://localhost:7124/api/Payment";

function getAuthHeader(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const paymentApi = {
  async create(dto: CreatePaymentDto): Promise<PaymentDto> {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) throw new Error("Errore creazione payment");

    return res.json();
  },

  async update(id: string, dto: UpdatePaymentDto): Promise<PaymentDto> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) throw new Error("Errore aggiornamento payment");

    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!res.ok) throw new Error("Payment deletion error");
  },
};
