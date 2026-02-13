import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { useDispatch } from "react-redux";

import type { ChargeDto } from "../../redux/features/charge/chargeTypes";
import type { InvoiceDto } from "../../redux/features/invoice/invoiceTypes";
import type { PaymentDto } from "../../redux/features/payment/paymentTypes";
import { createInvoice } from "../../redux/features/invoice/invoiceSlice";
import type { AppDispatch } from "../../redux/store";
import { invoiceApi } from "../../api/invoiceAPI";

interface InvoiceFormProps {
  reservationId: string;
  charges: ChargeDto[];
  reservationAmount: number;
  payments: PaymentDto[];
  invoices?: InvoiceDto[];
  room?: { roomNumber: string; roomName: string; roomPrice?: number };
  roomIsInvoiced?: boolean;
  onInvoiceCreated?: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = React.memo(
  ({ reservationId, charges, payments, invoices = [], room, roomIsInvoiced = false, onInvoiceCreated }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [selectedCharges, setSelectedCharges] = useState<ChargeDto[]>([]);
    const [includeRoom, setIncludeRoom] = useState(false);
    const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
    const [localRoomInvoiced, setLocalRoomInvoiced] = useState(roomIsInvoiced);

    const [customer, setCustomer] = useState({
      firstName: "",
      lastName: "",
      taxCode: "",
      vatNumber: "",
      address: "",
      city: "",
      country: "",
    });

    useEffect(() => {
      console.log("InvoiceForm mounted, roomIsInvoiced prop:", roomIsInvoiced);
      setLocalRoomInvoiced(roomIsInvoiced);
      if (roomIsInvoiced) {
        setIncludeRoom(false);
      }
    }, [roomIsInvoiced]);

    //Handle
    const handleCustomerChange = (field: keyof typeof customer, value: string) => {
      setCustomer((prev) => ({ ...prev, [field]: value }));
    };

    const toggleCharge = useCallback((charge: ChargeDto) => {
      setSelectedCharges((prev) => (prev.some((c) => c.id === charge.id) ? prev.filter((c) => c.id !== charge.id) : [...prev, charge]));
    }, []);

    const togglePayment = useCallback((paymentId: string) => {
      setSelectedPayments((prev) => (prev.includes(paymentId) ? prev.filter((id) => id !== paymentId) : [...prev, paymentId]));
    }, []);

    const safeRoomPrice = useMemo(() => room?.roomPrice ?? 0, [room]);

    const totalToInvoice = useMemo(() => {
      let total = includeRoom && !localRoomInvoiced ? safeRoomPrice : 0;
      total += selectedCharges.reduce((sum, c) => sum + (c.unitPrice ?? 0) * (c.quantity ?? 1), 0);
      return total;
    }, [includeRoom, safeRoomPrice, selectedCharges, localRoomInvoiced]);

    const totalSelectedPayments = useMemo(() => {
      return payments.filter((p) => selectedPayments.includes(p.id)).reduce((sum, p) => sum + (p.amount ?? 0), 0);
    }, [selectedPayments, payments]);

    const validateInvoice = () => {
      if (!customer.firstName || !customer.lastName) return "Customer first and last name are required";
      if (!includeRoom && selectedCharges.length === 0) return "Select at least one item to invoice";
      if (totalSelectedPayments < totalToInvoice) return "Selected payments do not cover the total to invoice";
      return "";
    };

    const handleCreateInvoice = async () => {
      const validationError = validateInvoice();
      if (validationError) {
        setError(validationError);
        return;
      }

      setError("");
      setLoading(true);

      try {
        const items = [
          ...(includeRoom && !localRoomInvoiced
            ? [
                {
                  description: `Room - ${room?.roomNumber ?? ""}`,
                  quantity: 1,
                  unitPrice: safeRoomPrice,
                  vatRate: 22,
                },
              ]
            : []),
          ...selectedCharges.map((c) => ({
            description: c.description,
            quantity: c.quantity ?? 1,
            unitPrice: c.unitPrice ?? 0,
            vatRate: c.vatRate ?? 0,
          })),
        ];

        await dispatch(
          createInvoice({
            reservationId,
            customer: {
              firstName: customer.firstName,
              lastName: customer.lastName,
              taxCode: customer.taxCode || undefined,
              vatNumber: customer.vatNumber || undefined,
              address: customer.address || undefined,
              city: customer.city || undefined,
              country: customer.country || undefined,
            },
            items,
          }),
        ).unwrap();

        if (includeRoom) setLocalRoomInvoiced(true);

        setSelectedCharges([]);
        setIncludeRoom(false);
        setSelectedPayments([]);
        setCustomer({ firstName: "", lastName: "", taxCode: "", vatNumber: "", address: "", city: "", country: "" });

        onInvoiceCreated?.();
        alert("Invoice created successfully!");
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Error creating invoice");
      } finally {
        setLoading(false);
      }
    };

    const selectablePayments = payments.filter((p) => !p.isInvoiced && p.status !== "Completed");
    const selectableCharges = charges.filter((c) => !c.isInvoiced);

    const roomInvoiceNumber = invoices.find((inv) => inv.items?.some((it) => it.description.includes(`Room - ${room?.roomNumber}`)))?.invoiceNumber;

    return (
      <div>
        {error && <Alert variant="danger">{error}</Alert>}

        <h6>Customer</h6>
        {["firstName", "lastName", "taxCode", "vatNumber", "address", "city", "country"].map((field) => (
          <Form.Group className="mb-2" key={field}>
            <Form.Label>{field === "firstName" ? "First Name*" : field === "lastName" ? "Last Name*" : field}</Form.Label>
            <Form.Control
              value={customer[field as keyof typeof customer]}
              onChange={(e) => handleCustomerChange(field as keyof typeof customer, e.target.value)}
            />
          </Form.Group>
        ))}

        <hr />
        <h6>Select payments to use:</h6>
        {selectablePayments.length === 0 && <p className="text-muted">No payments available</p>}
        {selectablePayments.map((p) => (
          <Form.Check
            key={p.id}
            type="checkbox"
            label={`${p.type} - ${p.amount.toFixed(2)}€ - ${p.status}`}
            checked={selectedPayments.includes(p.id)}
            onChange={() => togglePayment(p.id)}
            className="mb-1"
          />
        ))}

        <hr />
        <h6>Select items to invoice:</h6>
        <Form.Check
          type="checkbox"
          label={
            roomIsInvoiced
              ? `Room - ${room?.roomNumber} - Invoiced${roomInvoiceNumber ? ` (Invoice: ${roomInvoiceNumber})` : ""}`
              : `Include Room - ${safeRoomPrice.toFixed(2)}€`
          }
          checked={includeRoom}
          onChange={() => {
            console.log("click includeRoom, roomIsInvoiced:", roomIsInvoiced, "includeRoom before:", includeRoom);
            if (!roomIsInvoiced) setIncludeRoom(!includeRoom);
          }}
          disabled={roomIsInvoiced}
          className={`mb-2 ${roomIsInvoiced ? "text-muted" : ""}`}
        />

        {selectableCharges.length === 0 && <p className="text-muted">No charges to invoice</p>}
        {selectableCharges.map((c) => (
          <Form.Check
            key={c.id}
            type="checkbox"
            label={`${c.description} - ${c.quantity} x ${c.unitPrice?.toFixed(2)}€`}
            checked={selectedCharges.some((sc) => sc.id === c.id)}
            onChange={() => toggleCharge(c)}
            className="mb-1"
          />
        ))}

        <div className="mt-3">
          <p>
            <strong>Total to invoice:</strong> {totalToInvoice.toFixed(2)}€
          </p>
          <p>
            <strong>Total selected payments:</strong> {totalSelectedPayments.toFixed(2)}€
          </p>
          <Button variant="success" onClick={handleCreateInvoice} disabled={loading || totalSelectedPayments < totalToInvoice}>
            {loading ? <Spinner animation="border" size="sm" /> : "Create Invoice"}
          </Button>
        </div>

        {invoices.length > 0 && (
          <div className="mt-4">
            <h6>Reservation Invoices:</h6>
            <ul>
              {invoices.map((inv) => (
                <li key={inv.id}>
                  <span>
                    {inv.invoiceNumber} - {inv.totalAmount?.toFixed(2)}€
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={async () => {
                      try {
                        await invoiceApi.openPdf(inv.id);
                      } catch (err) {
                        console.error("Failed to open PDF:", err);
                        alert("Failed to open PDF");
                      }
                    }}
                  >
                    Open PDF
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
);

export default InvoiceForm;
