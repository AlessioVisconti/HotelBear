import type { ChargeDto } from "../charge/chargeTypes";
import type { GuestDto } from "../guest/guestTypes";

export interface ReservationListDto {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  roomId: string;
  roomNumber: string;
  checkIn: string; // ISO string
  checkOut: string; // ISO string
  status: "Pending" | "Confirmed" | "Cancelled" | "CheckedIn" | "CheckedOut";
}

export interface ReservationDetailDto {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  roomId: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: string;
  note?: string;
  paymentStatus: "NotPaid" | "PartiallyPaid" | "Paid";
  remainingAmount: number;
  guests: GuestDto[];
  payments: PaymentDto[];
  charges: ChargeDto[];
  invoices: InvoiceDto[];
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  deletedBy?: string;
  deletedAt?: string;
}

export interface PaymentDto {
  id: string;
  reservationId: string;
  amount: number;
  type: string;
  status: string;
  paymentMethodCode?: string;
  paidAt?: string;
}

export interface InvoiceDto {
  id: string;
  reservationId: string;
  invoiceNumber?: string;
  status?: string;
  totalAmount?: number;
  balanceDue?: number;
}

export interface CreateReservationDto {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  note?: string;
}

export interface UpdateReservationDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  note?: string;
  status?: "Pending" | "Confirmed" | "Cancelled" | "CheckedIn" | "CheckedOut";
}

export interface ReservationSearchDto {
  customerName?: string;
  email?: string;
  phone?: string;
  roomId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}
