export interface PaymentMethodDto {
  id: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface CreatePaymentMethodDto {
  code: string;
  description: string;
}

export interface UpdatePaymentMethodDto {
  description?: string;
  isActive?: boolean;
}
