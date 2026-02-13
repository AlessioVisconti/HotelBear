export interface InvoicePaymentDto {
  paymentId: string;
  amountApplied: number;
}

export interface InvoiceDto {
  id: string;
  reservationId: string;
  invoiceNumber?: string;
  status?: "Draft" | "Issued" | "Cancelled";
  totalAmount?: number;
  balanceDue?: number;
  createdAt?: string;
  items?: CreateInvoiceItemDto[];
  invoicePayments?: InvoicePaymentDto[];
}

export interface InvoiceCustomerDto {
  firstName: string;
  lastName: string;
  taxCode?: string;
  vatNumber?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface CreateInvoiceItemDto {
  description: string;
  unitPrice: number;
  quantity: number;
  vatRate: number;
}

export interface CreateInvoiceRequestDto {
  reservationId: string;
  customer?: InvoiceCustomerDto;
  items: CreateInvoiceItemDto[];
}
