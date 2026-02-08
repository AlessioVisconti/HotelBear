import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Modal, Button, Form, Spinner, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import { fetchRoomById, updateRoom, deleteRoom } from "../../redux/features/room/roomSlice";
import RoomPhotoManager from "./RoomPhotoManager";
import type { UpdateRoomDto } from "../../redux/features/room/roomTypes";

interface Props {
  show: boolean;
  roomId: string;
  onHide: () => void;
}

const EditRoomModal: React.FC<Props> = ({ show, roomId, onHide }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selected, loadingDetail, loadingCrud } = useSelector((state: RootState) => state.room);

  const initialFormData = useMemo<UpdateRoomDto>(() => {
    if (!selected) return { roomNumber: "", roomName: "", description: "", beds: 1, bedsTypes: "", priceForNight: 0 };
    return {
      roomNumber: selected.roomNumber,
      roomName: selected.roomName,
      description: selected.description || "",
      beds: selected.beds,
      bedsTypes: selected.bedsTypes,
      priceForNight: selected.priceForNight,
    };
  }, [selected]);

  const [formData, setFormData] = useState<UpdateRoomDto>(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  useEffect(() => {
    if (show && roomId) dispatch(fetchRoomById(roomId));
  }, [dispatch, show, roomId]);

  //Handle
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "beds" || name === "priceForNight" ? (value === "" ? undefined : Number(value)) : value,
    }));
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    try {
      await dispatch(updateRoom({ id: roomId, dto: formData })).unwrap();
      onHide();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Errore salvataggio";
      alert(message);
    }
  }, [dispatch, roomId, formData, onHide]);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!window.confirm("Sei sicuro di voler eliminare questa camera?")) return;

    try {
      await dispatch(deleteRoom(roomId)).unwrap();
      onHide();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Errore eliminazione camera";
      alert(message);
    }
  }, [dispatch, roomId, onHide]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>✏️ Modifica Camera</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loadingDetail || !selected ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            <Form>
              <Row className="mb-3">
                <Col>
                  <Form.Label>Numero Camera</Form.Label>
                  <Form.Control name="roomNumber" value={formData.roomNumber || ""} onChange={handleChange} />
                </Col>
                <Col>
                  <Form.Label>Nome Camera</Form.Label>
                  <Form.Control name="roomName" value={formData.roomName || ""} onChange={handleChange} />
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Descrizione</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={formData.description || ""} onChange={handleChange} />
              </Form.Group>

              <Row className="mb-3">
                <Col>
                  <Form.Label>Letti</Form.Label>
                  <Form.Control type="number" name="beds" value={formData.beds ?? ""} onChange={handleChange} />
                </Col>
                <Col>
                  <Form.Label>Tipo Letti</Form.Label>
                  <Form.Control name="bedsTypes" value={formData.bedsTypes || ""} onChange={handleChange} />
                </Col>
                <Col>
                  <Form.Label>Prezzo / Notte (€)</Form.Label>
                  <Form.Control type="number" name="priceForNight" value={formData.priceForNight ?? ""} onChange={handleChange} />
                </Col>
              </Row>
            </Form>

            <hr />

            <RoomPhotoManager room={selected} />
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="danger" onClick={handleDelete} disabled={loadingCrud}>
          🗑 Elimina
        </Button>

        <Button variant="primary" onClick={handleSave} disabled={loadingCrud}>
          {loadingCrud ? "Salvataggio..." : "💾 Salva Modifiche"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditRoomModal;
