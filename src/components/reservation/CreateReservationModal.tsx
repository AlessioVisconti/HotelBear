import React, { useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { createNewReservation } from "../../redux/features/reservation/reservationSlice";
import type { AppDispatch, RootState } from "../../redux/store";
import type { CreateReservationDto } from "../../redux/features/reservation/reservationTypes";

interface Props {
  show: boolean;
  onHide: () => void;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  onCreated?: () => void;
}

const CreateReservationModal: React.FC<Props> = ({ show, onHide, roomId, checkIn, checkOut, onCreated }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.reservation);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [localCheckIn, setLocalCheckIn] = useState(checkIn.toISOString().split("T")[0]);
  const [localCheckOut, setLocalCheckOut] = useState(() => {
    const defaultCheckOut = checkOut || new Date(checkIn.getTime() + 24 * 60 * 60 * 1000);
    return defaultCheckOut.toISOString().split("T")[0];
  });

  //Handle
  const handleOnShow = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setNote("");
    setLocalCheckIn(checkIn.toISOString().split("T")[0]);
    const defaultCheckOut = checkOut || new Date(checkIn.getTime() + 24 * 60 * 60 * 1000);
    setLocalCheckOut(defaultCheckOut.toISOString().split("T")[0]);
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const dto: CreateReservationDto = {
      firstName,
      lastName,
      email,
      phone,
      roomId,
      checkIn: new Date(localCheckIn).toISOString(),
      checkOut: new Date(localCheckOut).toISOString(),
      note,
    };

    dispatch(createNewReservation(dto)).then(() => {
      if (onCreated) onCreated();
      onHide();
    });
  };

  return (
    <Modal show={show} onHide={onHide} onShow={handleOnShow}>
      <Modal.Header closeButton>
        <Modal.Title>New Reservation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Phone</Form.Label>
            <Form.Control type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Check-in</Form.Label>
            <Form.Control type="date" value={localCheckIn} onChange={(e) => setLocalCheckIn(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Check-out</Form.Label>
            <Form.Control type="date" value={localCheckOut} onChange={(e) => setLocalCheckOut(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" value={note} onChange={(e) => setNote(e.target.value)} />
          </Form.Group>

          <div className="d-flex justify-content-end mt-3">
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Create"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateReservationModal;
