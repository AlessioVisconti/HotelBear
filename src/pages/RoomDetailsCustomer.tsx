import React, { useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, Carousel, Badge } from "react-bootstrap";

import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import type { RootState, AppDispatch } from "../redux/store";
import { fetchRoomById } from "../redux/features/room/roomSlice";

const RoomDetailsCustomer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const { selected: room, loadingDetail, error } = useSelector((state: RootState) => state.room);

  // FETCH ROOM DETAILS
  useEffect(() => {
    if (id) {
      dispatch(fetchRoomById(id));
    }
  }, [dispatch, id]);

  // LOADING STATE
  if (loadingDetail) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading room details...</p>
      </Container>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <Container className="mt-5 text-center">
        <h4 className="text-danger">Something went wrong</h4>
        <p>{error}</p>
        <Button variant="dark" onClick={() => navigate("/")}>
          ⬅ Back to Dashboard
        </Button>
      </Container>
    );
  }

  // ROOM NOT FOUND
  if (!room) {
    return (
      <Container className="mt-5 text-center">
        <h4>No room found</h4>
        <Button variant="dark" onClick={() => navigate("/")}>
          ⬅ Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      {/* BACK BUTTON */}
      <Button variant="outline-dark" className="mb-4" onClick={() => navigate(-1)}>
        ⬅ Back
      </Button>

      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
            {/* CAROUSEL */}
            {room.photos.length > 0 ? (
              <Carousel>
                {room.photos.map((photo) => (
                  <Carousel.Item key={photo.id}>
                    <div style={{ position: "relative" }}>
                      {photo.isCover && (
                        <Badge bg="warning" text="dark" className="position-absolute top-0 start-0 m-3 px-3 py-2">
                          ⭐ Cover Photo
                        </Badge>
                      )}
                      <img className="d-block w-100" src={`https://localhost:7124${photo.url}`} alt="Room" style={{ height: "450px", objectFit: "cover" }} />
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <div style={{ height: "300px", background: "#f1f1f1" }} className="d-flex justify-content-center align-items-center">
                <p className="text-muted">No photos available</p>
              </div>
            )}

            {/* BODY */}
            <Card.Body className="p-4">
              <h2 className="fw-bold mb-2">
                Room {room.roomNumber} — {room.roomName}
              </h2>
              <h4 className="text-success fw-bold mb-4">€ {room.priceForNight.toFixed(2)} / night</h4>
              <p className="text-muted fs-5">{room.description || "No description available for this room."}</p>

              <Row className="mt-4">
                <Col md={6}>
                  <p>
                    🛏 Beds: <strong>{room.beds}</strong>
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    🏷 Type: <strong>{room.bedsTypes}</strong>
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RoomDetailsCustomer;
