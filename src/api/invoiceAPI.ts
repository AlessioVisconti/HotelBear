import type { InvoiceDto, CreateInvoiceRequestDto } from "../redux/features/invoice/invoiceTypes";
import { getToken } from "../utils/token";

const API_URL = "https://localhost:7124/api/Invoice";

function getAuthHeader(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const invoiceApi = {
  async create(dto: CreateInvoiceRequestDto): Promise<InvoiceDto> {
    const res = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) throw new Error("Invoice creation error");
    return res.json();
  },

  async getById(invoiceId: string): Promise<InvoiceDto> {
    const res = await fetch(`${API_URL}/${invoiceId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!res.ok) throw new Error("Invoice loading error");
    return res.json();
  },

  async cancel(invoiceId: string): Promise<void> {
    const res = await fetch(`${API_URL}/${invoiceId}/cancel`, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!res.ok) throw new Error("Invoice cancellation error");
  },

  async openPdf(invoiceId: string): Promise<void> {
    const url = `${API_URL}/${invoiceId}/pdf`;
    const token = getToken();
    if (!token) throw new Error("Missing auth token");

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch PDF");
    }

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  },
};
