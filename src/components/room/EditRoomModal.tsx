import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Modal, Button, Form, Spinner, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import { fetchRoomById, updateRoom, deleteRoom } from "../../redux/features/room/roomSlice";
import RoomPhotoManager from "./RoomPhotoManager";
import type { UpdateRoomDto } from "../../redux/features/room/roomTypes";
import { BsPencilFill, BsTrash3Fill } from "react-icons/bs";

/* ✅ AGGIUNTA */
import ConfirmDeleteModal from "../ConfirmDeleteModal";

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

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

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
      const message = err instanceof Error ? err.message : "Save error";
      alert(message);
    }
  }, [dispatch, roomId, formData, onHide]);

  const handleDeleteConfirm = useCallback(async (): Promise<void> => {
    try {
      await dispatch(deleteRoom(roomId)).unwrap();
      setShowDeleteModal(false);
      onHide();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Room deletion error";
      alert(message);
    }
  }, [dispatch, roomId, onHide]);

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <BsPencilFill /> Modifica Camera
          </Modal.Title>
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
                    <Form.Label>Room Number</Form.Label>
                    <Form.Control name="roomNumber" value={formData.roomNumber || ""} onChange={handleChange} />
                  </Col>
                  <Col>
                    <Form.Label>Room Name</Form.Label>
                    <Form.Control name="roomName" value={formData.roomName || ""} onChange={handleChange} />
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} name="description" value={formData.description || ""} onChange={handleChange} />
                </Form.Group>

                <Row className="mb-3">
                  <Col>
                    <Form.Label>Beds</Form.Label>
                    <Form.Control type="number" name="beds" value={formData.beds ?? ""} onChange={handleChange} />
                  </Col>
                  <Col>
                    <Form.Label>Beds Type</Form.Label>
                    <Form.Control name="bedsTypes" value={formData.bedsTypes || ""} onChange={handleChange} />
                  </Col>
                  <Col>
                    <Form.Label>Price for Night (€)</Form.Label>
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
          {/* ✅ MODIFICATO: apre modale */}
          <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={loadingCrud}>
            <BsTrash3Fill /> Delete
          </Button>

          <Button variant="primary" onClick={handleSave} disabled={loadingCrud}>
            {loadingCrud ? "Saving..." : " Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ AGGIUNTA: ConfirmDeleteModal */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        itemName={selected?.roomName ?? "this room"}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default EditRoomModal;
