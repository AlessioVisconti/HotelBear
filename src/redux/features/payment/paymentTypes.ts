export type PaymentType = "Deposit" | "Balance" | "Extra";
export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Refunded";

export interface PaymentDto {
  id: string;
  reservationId: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  paymentMethodId?: string;
  paymentMethodCode?: string;
  paymentMethodDescription?: string;
  paidAt?: string;
  isInvoiced?: boolean;
}

export interface CreatePaymentDto {
  reservationId: string;
  amount: number;
  type: PaymentType;
  paymentMethodId: string;
  paidAt?: string;
}

export interface UpdatePaymentDto {
  amount?: number;
  type?: PaymentType;
  status?: PaymentStatus;
  paymentMethodId?: string;
  paidAt?: string;
}
