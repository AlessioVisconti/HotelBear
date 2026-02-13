import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Badge, Form, InputGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../redux/store";
import { fetchRooms, fetchAvailableRooms } from "../redux/features/room/roomSlice";
import CustomerReservationModal from "../components/reservation/CustomerReservationModal";
import { FaHandsClapping, FaThumbtack } from "react-icons/fa6";
import { BsSearch, BsCalendar3 } from "react-icons/bs";
import { LiaBedSolid } from "react-icons/lia";
import "../dashboard.css";

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux state
  const { firstName } = useSelector((state: RootState) => state.auth);
  const { list: rooms, loadingList, availableRooms, loadingAvailable } = useSelector((state: RootState) => state.room);

  // Local state
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [showCustomerReservationModal, setShowCustomerReservationModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  const handleSearchAvailability = () => {
    if (!checkIn || !checkOut) return;
    setHasSearched(true);
    dispatch(fetchAvailableRooms({ checkIn, checkOut }));
  };

  const filteredRooms = hasSearched ? availableRooms : rooms;
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="pb-5">
      {/* HERO HEADER */}
      <div
        className="text-white py-5 mb-0"
        style={{
          background: "var(--hotel-primary)",
          borderRadius: "0 0 2.5rem 2.5rem",
          minHeight: "250px",
        }}
      >
        <Container>
          <Row className="pt-4">
            <Col>
              <h2 className="fw-bold display-5">
                Welcome, {firstName || "Guest"} <FaHandsClapping className="ms-2" />
              </h2>
              <p className="lead opacity-75">Explore our luxury rooms and find your perfect stay.</p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* FLOATING SEARCH BAR */}
        <Card className="search-container border-0 mb-5">
          <Card.Body>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Label className="fw-bold small text-muted text-uppercase">Check-in</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <BsCalendar3 className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    className="border-start-0 ps-0"
                    type="date"
                    value={checkIn}
                    min={todayStr}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      setHasSearched(false);
                      if (checkOut && e.target.value > checkOut) setCheckOut("");
                    }}
                  />
                </InputGroup>
              </Col>

              <Col md={4}>
                <Form.Label className="fw-bold small text-muted text-uppercase">Check-out</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <BsCalendar3 className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    className="border-start-0 ps-0"
                    type="date"
                    value={checkOut}
                    min={checkIn || todayStr}
                    onChange={(e) => {
                      setCheckOut(e.target.value);
                      setHasSearched(false);
                    }}
                  />
                </InputGroup>
              </Col>

              <Col md={4}>
                <Button
                  variant="dark"
                  className="btn-custom w-100 rounded-3 shadow-sm"
                  disabled={!checkIn || !checkOut || loadingAvailable}
                  onClick={handleSearchAvailability}
                >
                  {loadingAvailable ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <>
                      <BsSearch className="me-2" /> Search Availability
                    </>
                  )}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* LOADING STATE */}
        {loadingList && (
          <div className="text-center my-5 py-5">
            <Spinner animation="grow" style={{ color: "var(--hotel-primary)" }} />
            <p className="mt-3 text-muted">Loading our best rooms for you...</p>
          </div>
        )}

        {/* ROOM GRID */}
        {!loadingList && (
          <Row className="g-4">
            {filteredRooms.map((room) => (
              <Col key={room.id} xs={12} md={6} lg={4}>
                <Card className="room-card h-100 shadow-sm">
                  {/* COVER IMAGE WRAPPER */}
                  <div className="card-img-wrapper">
                    <Card.Img variant="top" src={`https://localhost:7124${room.coverPhotoUrl}`} style={{ height: "240px", objectFit: "cover" }} />
                    <Badge className="price-badge" style={{ position: "absolute", bottom: "15px", right: "15px", color: "white" }}>
                      <span className="fs-5 fw-bold">€ {room.priceForNight.toFixed(0)}</span>
                      <span className="small opacity-75"> / night</span>
                    </Badge>
                  </div>

                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="fw-bold mb-0">Room {room.roomNumber}</Card.Title>
                      <Badge bg="light" text="dark" className="border">
                        #{room.roomName}
                      </Badge>
                    </div>

                    <Card.Text className="small text-muted mb-4" style={{ minHeight: "3rem" }}>
                      {room.description ?? "Experience unmatched comfort in our thoughtfully designed guest rooms."}
                    </Card.Text>

                    <div className="d-flex gap-3 mb-4 text-muted small border-top pt-3">
                      <span className="d-flex align-items-center gap-1">
                        <LiaBedSolid size={18} /> <strong>{room.beds}</strong> Beds
                      </span>
                      <span className="text-capitalize">• {room.bedsTypes}</span>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="d-grid gap-2">
                      <Button variant="outline-dark" className="btn-custom rounded-pill btn-sm" onClick={() => navigate(`/roomdetails/${room.id}`)}>
                        View Details
                      </Button>

                      <Button
                        variant="primary"
                        className="btn-custom rounded-pill btn-sm"
                        style={{ backgroundColor: "var(--hotel-primary)", border: "none" }}
                        disabled={!checkIn || !checkOut}
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setShowCustomerReservationModal(true);
                        }}
                      >
                        <FaThumbtack className="me-2" /> Book Now
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* EMPTY STATE */}
        {!loadingList && !loadingAvailable && filteredRooms.length === 0 && (
          <div className="text-center my-5 py-5 bg-white rounded-4 shadow-sm">
            <BsSearch size={50} className="text-muted mb-3 opacity-25" />
            <h4 className="fw-bold">No rooms available</h4>
            <p className="text-muted">Try changing your check-in or check-out dates.</p>
          </div>
        )}
      </Container>

      {/* RESERVATION MODAL */}
      {selectedRoomId && (
        <CustomerReservationModal
          show={showCustomerReservationModal}
          onHide={() => setShowCustomerReservationModal(false)}
          roomId={selectedRoomId}
          checkIn={new Date(checkIn)}
          checkOut={new Date(checkOut)}
          onCreated={() => {
            alert("Reservation created successfully!");
            setShowCustomerReservationModal(false);
          }}
        />
      )}

      <div className="text-center mt-4">
        <small className="text-muted">© 2026 Hotel Management System</small>
      </div>
    </div>
  );
};

export default DashboardPage;
