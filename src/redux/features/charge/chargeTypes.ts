export interface ChargeDto {
  id?: string;
  reservationId: string;
  description: string;
  type: "Food" | "Drink" | "Minibar" | "RoomService" | "Extra";
  unitPrice: number;
  quantity: number;
  amount: number;
  vatRate: number;
  isInvoiced: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  deletedBy?: string;
  deletedAt?: string;
}

export interface ChargeState {
  charges: ChargeDto[];
  loading: boolean;
  error: string | null;
}
