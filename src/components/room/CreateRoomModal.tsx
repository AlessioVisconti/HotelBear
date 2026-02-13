import React, { useState, useCallback, useMemo } from "react";
import { Modal, Button, Form, Spinner, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../redux/store";
import { createRoom } from "../../redux/features/room/roomSlice";
import type { CreateRoomDto } from "../../redux/features/room/roomTypes";
import { TiPlus } from "react-icons/ti";

interface Props {
  show: boolean;
  onHide: () => void;
}

const CreateRoomModal: React.FC<Props> = React.memo(({ show, onHide }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { loadingCrud } = useSelector((state: RootState) => state.room);

  const initialFormData = useMemo<CreateRoomDto>(
    () => ({
      roomNumber: "",
      roomName: "",
      description: "",
      beds: 1,
      bedsTypes: "",
      priceForNight: 0,
    }),
    [],
  );

  const [formData, setFormData] = useState<CreateRoomDto>(initialFormData);

  //Handle
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "beds" || name === "priceForNight" ? Number(value) : value,
    }));
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    if (!formData.roomNumber.trim() || !formData.roomName.trim()) {
      alert("Room number and name are required");
      return;
    }

    try {
      await dispatch(createRoom(formData)).unwrap();
      onHide();
      setFormData(initialFormData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Room creation error";
      alert(message);
    }
  }, [dispatch, formData, onHide, initialFormData]);

  const handleClose = useCallback(() => {
    setFormData(initialFormData);
    onHide();
  }, [initialFormData, onHide]);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <TiPlus /> Create New Room
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Label>Room Number</Form.Label>
              <Form.Control name="roomNumber" value={formData.roomNumber} onChange={handleChange} />
            </Col>

            <Col>
              <Form.Label>Room Name</Form.Label>
              <Form.Control name="roomName" value={formData.roomName} onChange={handleChange} />
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
          </Form.Group>

          <Row className="mb-3">
            <Col>
              <Form.Label>Beds</Form.Label>
              <Form.Control type="number" name="beds" value={formData.beds} onChange={handleChange} />
            </Col>

            <Col>
              <Form.Label>Beds Type</Form.Label>
              <Form.Control name="bedsTypes" value={formData.bedsTypes} onChange={handleChange} />
            </Col>

            <Col>
              <Form.Label>Price for Night (€)</Form.Label>
              <Form.Control type="number" name="priceForNight" value={formData.priceForNight} onChange={handleChange} />
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>

        <Button variant="success" onClick={handleSave} disabled={loadingCrud}>
          {loadingCrud ? (
            <>
              <Spinner size="sm" animation="border" /> Creation...
            </>
          ) : (
            "The room was created"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

export default CreateRoomModal;
