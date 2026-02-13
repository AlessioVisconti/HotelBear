import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReservationById,
  updateExistingReservation,
  cancelExistingReservation,
  clearCurrentReservation,
} from "../../redux/features/reservation/reservationSlice";
import { deleteGuest } from "../../redux/features/guest/guestSlice";
import { deleteCharge } from "../../redux/features/charge/chargeSlice";
import { deletePayment } from "../../redux/features/payment/paymentSlice";
import { fetchPaymentMethods } from "../../redux/features/paymentMethod/paymentMethodSlice";
import type { AppDispatch, RootState } from "../../redux/store";
import type { UpdateReservationDto } from "../../redux/features/reservation/reservationTypes";
import type { GuestDto } from "../../redux/features/guest/guestTypes";
import type { ChargeDto } from "../../redux/features/charge/chargeTypes";
import type { PaymentDto } from "../../redux/features/payment/paymentTypes";
import GuestForm from "../guest/GuestForm";
import ChargeForm from "../charge/ChargeForm";
import PaymentForm from "../payment/PaymentForm";
import InvoiceForm from "../invoice/InvoiceForm";

import ConfirmDeleteModal from "../ConfirmDeleteModal";
import { BsCreditCardFill, BsPencilFill, BsTrash3Fill } from "react-icons/bs";
import { RiMoneyEuroBoxFill } from "react-icons/ri";
import { MdPeopleAlt } from "react-icons/md";
import { FaFileInvoice } from "react-icons/fa";

interface EditReservationModalProps {
  show: boolean;
  onHide: () => void;
  reservationId: string;
  onUpdated?: () => void;
}

export const EditReservationModal: React.FC<EditReservationModalProps> = ({ show, onHide, reservationId, onUpdated }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentReservation, loading, error } = useSelector((state: RootState) => state.reservation);
  const { rooms } = useSelector((state: RootState) => state.calendar);
  const { loading: methodsLoading } = useSelector((state: RootState) => state.paymentMethod);

  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    note: "",
    checkIn: "",
    checkOut: "",
    roomId: "",
    status: "Pending" as "Pending" | "Confirmed" | "Cancelled" | "CheckedIn" | "CheckedOut",
  });

  const [selectedGuest, setSelectedGuest] = useState<GuestDto | null>(null);
  const [guestFormKey, setGuestFormKey] = useState(0);
  const [selectedCharge, setSelectedCharge] = useState<ChargeDto | null>(null);
  const [chargeFormKey, setChargeFormKey] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDto | null>(null);
  const [paymentFormKey, setPaymentFormKey] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemName, setDeleteItemName] = useState("");
  const [deleteCallback, setDeleteCallback] = useState<() => void>(() => {});

  const handleClose = useCallback(() => {
    setSelectedGuest(null);
    setSelectedCharge(null);
    setSelectedPayment(null);
    onHide();
  }, [onHide]);

  const initialFormState = useMemo(() => {
    if (!currentReservation) return formState;

    const customerName = currentReservation.customerName ?? "";
    const [firstName, ...rest] = customerName.split(" ");
    const lastName = rest.join(" ");

    return {
      firstName,
      lastName,
      email: currentReservation.email ?? "",
      phone: currentReservation.phone ?? "",
      note: currentReservation.note ?? "",
      checkIn: currentReservation.checkIn ? currentReservation.checkIn.split("T")[0] : "",
      checkOut: currentReservation.checkOut ? currentReservation.checkOut.split("T")[0] : "",
      roomId: currentReservation.roomId ?? "",
      status: currentReservation.status as typeof formState.status,
    };
  }, [currentReservation]);

  useEffect(() => {
    setFormState(initialFormState);
  }, [initialFormState]);

  useEffect(() => {
    if (show) {
      setSelectedGuest(null);
      setSelectedCharge(null);
      setSelectedPayment(null);

      dispatch(fetchReservationById(reservationId));
      dispatch(fetchPaymentMethods());
    }

    return () => {
      dispatch(clearCurrentReservation());
    };
  }, [dispatch, reservationId, show]);

  const handleChange = useCallback((field: keyof typeof formState, value: string) => {
    setFormState((prev) => {
      const newState = { ...prev, [field]: value };
      if (field === "checkIn" && newState.checkOut && value > newState.checkOut) {
        newState.checkOut = "";
      }
      if (field === "checkOut" && newState.checkIn && value < newState.checkIn) {
        newState.checkOut = "";
      }
      return newState;
    });
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!currentReservation) return;

    const dto: UpdateReservationDto = {
      firstName: formState.firstName,
      lastName: formState.lastName,
      email: formState.email,
      phone: formState.phone,
      note: formState.note,
      roomId: formState.roomId,
      checkIn: formState.checkIn ? new Date(formState.checkIn).toISOString() : "",
      checkOut: formState.checkOut ? new Date(formState.checkOut).toISOString() : "",
      status: formState.status,
    };

    try {
      await dispatch(updateExistingReservation({ id: currentReservation.id, dto })).unwrap();
      onUpdated?.();
      handleClose();
    } catch (err: unknown) {
      let message = "Could not update reservation. Check dates and availability.";
      if (err instanceof Error) {
        message = err.message || message;
      }
      alert(message);
    }
  }, [dispatch, currentReservation, formState, onUpdated, handleClose]);

  const confirmDeleteGuest = useCallback(
    (g: GuestDto) => {
      setDeleteItemName(`${g.firstName ?? ""} ${g.lastName ?? ""}`);
      setDeleteCallback(() => async () => {
        if (!g.id) return;
        await dispatch(deleteGuest(g.id));
        await dispatch(fetchReservationById(reservationId));
        setShowDeleteModal(false);
      });
      setShowDeleteModal(true);
    },
    [dispatch, reservationId],
  );

  const confirmDeleteCharge = useCallback(
    (c: ChargeDto) => {
      setDeleteItemName(c.description ?? "");
      setDeleteCallback(() => async () => {
        if (!c.id) return;
        await dispatch(deleteCharge(c.id));
        await dispatch(fetchReservationById(reservationId));
        setShowDeleteModal(false);
      });
      setShowDeleteModal(true);
    },
    [dispatch, reservationId],
  );

  const confirmDeletePayment = useCallback(
    (p: PaymentDto) => {
      setDeleteItemName(`Payment ${p.amount.toFixed(2)}€`);
      setDeleteCallback(() => async () => {
        if (!p.id) return;
        await dispatch(deletePayment(p.id));
        await dispatch(fetchReservationById(reservationId));
        setShowDeleteModal(false);
      });
      setShowDeleteModal(true);
    },
    [dispatch, reservationId],
  );

  const confirmDeleteReservation = useCallback(() => {
    if (!currentReservation) return;
    setDeleteItemName(currentReservation.customerName ?? "Reservation");
    setDeleteCallback(() => async () => {
      await dispatch(cancelExistingReservation(currentReservation.id));
      onUpdated?.();
      handleClose();
      setShowDeleteModal(false);
    });
    setShowDeleteModal(true);
  }, [currentReservation, dispatch, handleClose, onUpdated]);

  if ((!currentReservation && loading) || methodsLoading) return <Spinner animation="border" />;

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Reservation</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {currentReservation && (
            <Form>
              {/* Reservation Info */}
              <Form.Group className="mb-2">
                <Form.Label>First Name</Form.Label>
                <Form.Control value={formState.firstName} onChange={(e) => handleChange("firstName", e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Last Name</Form.Label>
                <Form.Control value={formState.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Room</Form.Label>
                <Form.Select value={formState.roomId} onChange={(e) => handleChange("roomId", e.target.value)}>
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room.roomId} value={room.roomId ?? ""}>
                      {room.roomNumber} - {room.roomName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Check-in / Check-out */}
              <Form.Group className="mb-2">
                <Form.Label>Check-in</Form.Label>
                <Form.Control type="date" value={formState.checkIn} onChange={(e) => handleChange("checkIn", e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Check-out</Form.Label>
                <Form.Control type="date" value={formState.checkOut} onChange={(e) => handleChange("checkOut", e.target.value)} />
              </Form.Group>

              {/* Status */}
              <Form.Group className="mb-2">
                <Form.Label>Status</Form.Label>
                <Form.Select value={formState.status} onChange={(e) => handleChange("status", e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="CheckedIn">Checked In</option>
                  <option value="CheckedOut">Checked Out</option>
                </Form.Select>
              </Form.Group>

              {/* Remaining Amount */}
              <Form.Group className="mb-2">
                <Form.Label>Remaining Amount</Form.Label>
                <Form.Control value={currentReservation.remainingAmount?.toFixed(2) ?? "0.00"} readOnly />
              </Form.Group>

              {/* Guests */}
              <hr />
              <h5>
                <MdPeopleAlt /> Guests
              </h5>

              <GuestForm
                key={`guest-${selectedGuest?.id ?? guestFormKey}`}
                guest={selectedGuest}
                reservationId={reservationId}
                onSaved={async () => {
                  if (!selectedGuest) setGuestFormKey((k) => k + 1);
                  setSelectedGuest(null);
                  await dispatch(fetchReservationById(reservationId)).unwrap();
                }}
              />

              {currentReservation.guests.map((g) => (
                <div key={g.id ?? crypto.randomUUID()} className="border rounded p-2 mb-2 d-flex justify-content-between align-items-center">
                  <div>
                    <strong>
                      {g.firstName} {g.lastName}
                    </strong>
                    <div className="text-muted">{g.role}</div>
                  </div>

                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary" onClick={() => setSelectedGuest(g)}>
                      <BsPencilFill />
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => confirmDeleteGuest(g)}>
                      <BsTrash3Fill />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Charges */}
              <hr />
              <h5>
                <RiMoneyEuroBoxFill /> Charges
              </h5>

              <ChargeForm
                key={`charge-${selectedCharge?.id ?? chargeFormKey}`}
                charge={selectedCharge}
                reservationId={reservationId}
                onSaved={async () => {
                  if (!selectedCharge) setChargeFormKey((k) => k + 1);
                  setSelectedCharge(null);
                  await dispatch(fetchReservationById(reservationId)).unwrap();
                }}
              />

              {currentReservation.charges.map((c) => {
                const total = Math.round((c.quantity ?? 0) * (c.unitPrice ?? 0) * 100) / 100;

                const invoice = currentReservation.invoices.find((inv) =>
                  inv.items?.some((item) => item.description === c.description && item.unitPrice === c.unitPrice),
                );

                return (
                  <div key={c.id ?? crypto.randomUUID()} className="border rounded p-2 mb-2 d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{c.description}</strong>
                      <div className="text-muted">
                        {c.quantity} x {c.unitPrice}€ | <strong>total {total.toFixed(2)}€</strong>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      {c.isInvoiced ? (
                        <span className="badge bg-success align-self-center">Invoiced{invoice?.invoiceNumber ? ` #${invoice.invoiceNumber}` : ""}</span>
                      ) : (
                        <>
                          <Button size="sm" variant="outline-primary" onClick={() => setSelectedCharge(c)}>
                            <BsPencilFill />
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => confirmDeleteCharge(c)}>
                            <BsTrash3Fill />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Payments */}
              <hr />
              <h5>
                <BsCreditCardFill />
                Payments
              </h5>

              <PaymentForm
                key={`payment-${selectedPayment?.id ?? paymentFormKey}`}
                reservationId={reservationId}
                payment={selectedPayment}
                onSaved={async () => {
                  if (!selectedPayment) setPaymentFormKey((k) => k + 1);
                  setSelectedPayment(null);
                  await dispatch(fetchReservationById(reservationId)).unwrap();
                }}
              />

              {currentReservation.payments.map((p) => (
                <div key={p.id ?? crypto.randomUUID()} className="border rounded p-2 mb-2 d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{p.amount.toFixed(2)}€</strong>
                    <div className="text-muted">
                      {p.type} | {p.status} {p.paymentMethodCode ? `- ${p.paymentMethodCode}` : ""}
                    </div>
                    {p.paidAt && <div className="text-muted">Paid on: {new Date(p.paidAt).toLocaleDateString()}</div>}
                  </div>

                  <div className="d-flex gap-2">
                    {p.isInvoiced ? (
                      <span className="badge bg-success align-self-center">Invoiced</span>
                    ) : (
                      <>
                        <Button size="sm" variant="outline-primary" onClick={() => setSelectedPayment(p)}>
                          <BsPencilFill />
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => confirmDeletePayment(p)}>
                          <BsTrash3Fill />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Invoices */}
              <hr />
              <h5>
                <FaFileInvoice /> Invoices
              </h5>

              <InvoiceForm
                reservationId={reservationId}
                charges={currentReservation.charges}
                reservationAmount={currentReservation.remainingAmount ?? 0}
                payments={currentReservation.payments}
                invoices={currentReservation.invoices}
                room={rooms.find((r) => r.roomId === currentReservation.roomId)}
                roomIsInvoiced={currentReservation.isRoomInvoiced ?? false}
                onInvoiceCreated={async () => {
                  await dispatch(fetchReservationById(reservationId)).unwrap();
                  setFormState((prev) => ({ ...prev }));
                }}
              />

              {/* Actions */}
              <div className="d-flex justify-content-between mt-3">
                <Button variant="danger" onClick={confirmDeleteReservation}>
                  Cancel Reservation
                </Button>
                <Button variant="primary" onClick={handleUpdate}>
                  Update
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      <ConfirmDeleteModal show={showDeleteModal} itemName={deleteItemName} onCancel={() => setShowDeleteModal(false)} onConfirm={deleteCallback} />
    </>
  );
};
