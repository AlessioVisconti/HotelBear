import type { ChargeDto } from "../charge/chargeTypes";
import type { GuestDto } from "../guest/guestTypes";
import type { InvoiceDto } from "../invoice/invoiceTypes";
import type { PaymentDto } from "../payment/paymentTypes";

export interface ReservationListDto {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  roomId: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
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
  isRoomInvoiced: boolean;
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
