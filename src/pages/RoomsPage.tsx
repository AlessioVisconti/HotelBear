import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Container, Table, Button, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../redux/store";
import { fetchRooms } from "../redux/features/room/roomSlice";
import type { RoomListDto } from "../redux/features/room/roomTypes";

import EditRoomModal from "../components/room/EditRoomModal";
import CreateRoomModal from "../components/room/CreateRoomModal";

const RoomsPage: React.FC = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();

  const { list, loadingList } = useSelector((state: RootState) => state.room);

  // Stato modale EDIT
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Stato modale CREATE
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  //Handle
  const handleEditClick = useCallback((roomId: string) => {
    setSelectedRoomId(roomId);
    setShowEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const roomsTable = useMemo(() => {
    return list.map((room: RoomListDto) => (
      <tr key={room.id}>
        <td>{room.roomNumber}</td>
        <td>{room.roomName}</td>
        <td>€ {room.priceForNight.toFixed(2)}</td>

        <td className="text-end">
          <Button size="sm" variant="outline-primary" onClick={() => handleEditClick(room.id)}>
            ✏️
          </Button>
        </td>
      </tr>
    ));
  }, [list, handleEditClick]);

  return (
    <Container className="mt-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Gestione Camere</h2>

        <Button variant="success" onClick={handleOpenCreateModal}>
          + Aggiungi Camera
        </Button>
      </div>

      {/* LOADING */}
      {loadingList && (
        <div className="text-center mt-4">
          <Spinner animation="border" />
        </div>
      )}

      {/* TABLE */}
      {!loadingList && (
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>Numero</th>
              <th>Nome</th>
              <th>Prezzo/notte</th>
              <th className="text-end">Azioni</th>
            </tr>
          </thead>

          <tbody>{roomsTable}</tbody>
        </Table>
      )}

      {/* MODALE EDIT */}
      {selectedRoomId && <EditRoomModal show={showEditModal} roomId={selectedRoomId} onHide={handleCloseEditModal} />}

      {/* MODALE CREATE */}
      <CreateRoomModal show={showCreateModal} onHide={handleCloseCreateModal} />
    </Container>
  );
});

export default RoomsPage;
