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

import type { AppDispatch, RootState } from "../../redux/store";
import type { UpdateReservationDto } from "../../redux/features/reservation/reservationTypes";
import type { GuestDto } from "../../redux/features/guest/guestTypes";
import type { ChargeDto } from "../../redux/features/charge/chargeTypes";

import GuestForm from "../guest/GuestForm";
import ChargeForm from "../charge/ChargeForm";
import ConfirmDeleteModal from "../ConfirmDeleteModal";

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

  // Stati per la conferma eliminazione
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemName, setDeleteItemName] = useState("");
  const [deleteCallback, setDeleteCallback] = useState<() => void>(() => {});

  const handleClose = useCallback(() => {
    setSelectedGuest(null);
    setSelectedCharge(null);
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
      dispatch(fetchReservationById(reservationId));
    }
    return () => {
      dispatch(clearCurrentReservation());
    };
  }, [dispatch, reservationId, show]);

  const handleChange = useCallback((field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleUpdate = useCallback(() => {
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

    dispatch(updateExistingReservation({ id: currentReservation.id, dto })).then(() => {
      onUpdated?.();
      handleClose();
    });
  }, [dispatch, currentReservation, formState, onUpdated, handleClose]);

  // Conferma cancellazioni varie
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

  const confirmDeleteReservation = useCallback(() => {
    if (!currentReservation) return;

    setDeleteItemName(`${currentReservation.customerName ?? "Prenotazione"}`);
    setDeleteCallback(() => async () => {
      await dispatch(cancelExistingReservation(currentReservation.id));
      onUpdated?.();
      handleClose();
      setShowDeleteModal(false);
    });
    setShowDeleteModal(true);
  }, [currentReservation, dispatch, handleClose, onUpdated]);

  if (!currentReservation && loading) return <Spinner animation="border" />;

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifica Prenotazione</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {currentReservation && (
            <Form>
              {/* Reservation Info */}
              <Form.Group className="mb-2">
                <Form.Label>Nome</Form.Label>
                <Form.Control value={formState.firstName} onChange={(e) => handleChange("firstName", e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Cognome</Form.Label>
                <Form.Control value={formState.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Camera</Form.Label>
                <Form.Select value={formState.roomId} onChange={(e) => handleChange("roomId", e.target.value)}>
                  <option value="">Seleziona stanza</option>
                  {rooms.map((room) => (
                    <option key={room.roomId} value={room.roomId ?? ""}>
                      {room.roomNumber} - {room.roomName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Guests */}
              <hr />
              <h5>👥 Guest</h5>
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
                      {g.firstName ?? ""} {g.lastName ?? ""}
                    </strong>
                    <div className="text-muted">{g.role ?? ""}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary" onClick={() => setSelectedGuest(g)}>
                      ✏️
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => confirmDeleteGuest(g)}>
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}

              {/* Charges */}
              <hr />
              <h5>💰 Charges</h5>
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

                return (
                  <div key={c.id ?? crypto.randomUUID()} className="border rounded p-2 mb-2 d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{c.description ?? ""}</strong>
                      <div className="text-muted">
                        {c.quantity ?? 0} x {c.unitPrice ?? 0}€ - IVA {c.vatRate ?? 0}% | <strong>tot. {total.toFixed(2)}€</strong>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => setSelectedCharge(c)}>
                        ✏️
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => confirmDeleteCharge(c)}>
                        🗑️
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Actions */}
              <div className="d-flex justify-content-between mt-3">
                <Button variant="danger" onClick={confirmDeleteReservation}>
                  Cancella
                </Button>
                <Button variant="primary" onClick={handleUpdate}>
                  Aggiorna
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Modale conferma eliminazione */}
      <ConfirmDeleteModal show={showDeleteModal} itemName={deleteItemName} onCancel={() => setShowDeleteModal(false)} onConfirm={deleteCallback} />
    </>
  );
};
