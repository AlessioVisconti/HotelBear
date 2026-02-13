export interface GuestDto {
  id?: string;
  reservationId: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  birthCity?: string;
  citizenship?: string;
  role: string;
  taxCode?: string;
  address?: string;
  cityOfResidence?: string;
  province?: string;
  postalCode?: string;
  documentType?: string;
  documentNumber?: string;
  documentExpiration?: string;
}
