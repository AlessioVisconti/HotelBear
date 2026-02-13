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

const CustomerReservationModal: React.FC<Props> = ({ show, onHide, roomId, checkIn, checkOut, onCreated }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.reservation);
  const { token, firstName, lastName, email } = useSelector((state: RootState) => state.auth);

  const isAuthenticated = !!token;

  const initialFormData = {
    firstName: isAuthenticated ? firstName : "",
    lastName: isAuthenticated ? lastName : "",
    email: isAuthenticated ? email : "",
    phone: "",
    note: "",
    checkIn: checkIn.toISOString().split("T")[0],
    checkOut: (checkOut || new Date(checkIn.getTime() + 24 * 60 * 60 * 1000)).toISOString().split("T")[0],
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleOnShow = () => {
    setFormData(initialFormData);
  };

  // SUBMIT
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dto: CreateReservationDto = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      roomId,
      checkIn: new Date(formData.checkIn).toISOString(),
      checkOut: new Date(formData.checkOut).toISOString(),
      note: formData.note,
    };

    dispatch(createNewReservation(dto)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        if (onCreated) onCreated();
        onHide();
      }
    });
  };

  return (
    <Modal show={show} onHide={onHide} onShow={handleOnShow} centered>
      <Modal.Header closeButton>
        <Modal.Title>📌 Book This Room</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* CUSTOMER INFO */}
          <Form.Group className="mb-2">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </Form.Group>

          {/* PHONE */}
          <Form.Group className="mb-2">
            <Form.Label>Phone</Form.Label>
            <Form.Control type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          </Form.Group>

          {/* CHECK-IN / CHECK-OUT */}
          <Form.Group className="mb-2">
            <Form.Label>Check-in</Form.Label>
            <Form.Control type="date" value={formData.checkIn} readOnly />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Check-out</Form.Label>
            <Form.Control type="date" value={formData.checkOut} readOnly />
          </Form.Group>

          {/* NOTE */}
          <Form.Group className="mb-2">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
          </Form.Group>

          {/* BUTTON */}
          <div className="d-flex justify-content-end mt-3">
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Confirm Booking"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CustomerReservationModal;
