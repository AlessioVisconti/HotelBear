import React, { useState, useCallback } from "react";
import { Button, Form, Row, Col, Card, Spinner, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import type { RoomDetailDto } from "../../redux/features/room/roomTypes";
import type { RootState, AppDispatch } from "../../redux/store";

import { addRoomPhoto, deleteRoomPhoto, setRoomPhotoCover } from "../../redux/features/room/roomSlice";
import { TiStarFullOutline } from "react-icons/ti";
import { MdMonochromePhotos } from "react-icons/md";

interface Props {
  room: RoomDetailDto;
}

const RoomPhotoManager: React.FC<Props> = ({ room }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { loadingCrud } = useSelector((state: RootState) => state.room);

  const [file, setFile] = useState<File | null>(null);
  const [isCover, setIsCover] = useState<boolean>(false);

  //Handle
  const handleUpload = useCallback(async (): Promise<void> => {
    if (!file) {
      alert("Select a file!");
      return;
    }

    try {
      await dispatch(
        addRoomPhoto({
          roomId: room.id,
          file,
          isCover,
          currentPhotosCount: room.photos.length,
        }),
      ).unwrap();

      // reset input
      setFile(null);
      setIsCover(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Photo upload error";
      alert(message);
    }
  }, [dispatch, file, isCover, room.id, room.photos.length]);

  const handleDelete = useCallback(
    async (photoId: string): Promise<void> => {
      if (!window.confirm("Do you want to delete this photo?")) return;

      try {
        await dispatch(
          deleteRoomPhoto({
            photoId,
            roomId: room.id,
          }),
        ).unwrap();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error deleting photos";
        alert(message);
      }
    },
    [dispatch, room.id],
  );

  const handleSetCover = useCallback(
    async (photoId: string): Promise<void> => {
      try {
        await dispatch(
          setRoomPhotoCover({
            photoId,
            roomId: room.id,
          }),
        ).unwrap();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Set cover error";
        alert(message);
      }
    },
    [dispatch, room.id],
  );

  return (
    <div>
      <h5 className="fw-bold mb-3">
        <MdMonochromePhotos /> Photo Management
      </h5>

      {/* PHOTO */}
      <Row className="g-3 mb-4">
        {room.photos.length === 0 && <p className="text-muted">No photos uploaded.</p>}

        {room.photos.map((photo) => (
          <Col md={4} key={photo.id}>
            <Card className="shadow-sm position-relative">
              {/* BADGE COVER */}
              {photo.isCover && (
                <Badge bg="warning" text="dark" className="position-absolute top-0 start-0 m-2 px-3 py-2">
                  <TiStarFullOutline /> COVER
                </Badge>
              )}

              <Card.Img
                variant="top"
                src={`https://localhost:7124${photo.url}`}
                style={{
                  height: "150px",
                  objectFit: "cover",
                }}
              />

              <Card.Body className="d-flex justify-content-between align-items-center">
                {/* SET COVER */}
                {!photo.isCover && (
                  <Button size="sm" variant="outline-primary" disabled={loadingCrud} onClick={() => handleSetCover(photo.id)}>
                    Set Cover
                  </Button>
                )}

                {/* DELETE */}
                <Button size="sm" variant="outline-danger" disabled={loadingCrud} onClick={() => handleDelete(photo.id)}>
                  {loadingCrud ? <Spinner size="sm" animation="border" /> : "Delete"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* UPLOAD */}
      <Form>
        <Form.Group className="mb-2">
          <Form.Label>Upload new photo (max 3)</Form.Label>

          <Form.Control
            type="file"
            disabled={loadingCrud || room.photos.length >= 3}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)}
          />
        </Form.Group>

        <Form.Check
          type="checkbox"
          label="Set as cover"
          checked={isCover}
          disabled={loadingCrud}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsCover(e.target.checked)}
        />

        <Button className="mt-3" disabled={loadingCrud || room.photos.length >= 3} onClick={handleUpload}>
          {loadingCrud ? <Spinner size="sm" animation="border" /> : "Upload Photos"}
        </Button>
      </Form>
    </div>
  );
};

export default RoomPhotoManager;
