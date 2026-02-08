import { useState, useRef, useEffect } from "react";
import { Navbar, Container, Nav, Form, FormControl, Button, InputGroup, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { logout } from "../redux/features/auth/authSlice";
import { searchReservationList, fetchReservationById, clearSearch } from "../redux/features/reservation/reservationSlice";
import type { ReservationListDto, ReservationSearchDto } from "../redux/features/reservation/reservationTypes";
import { EditReservationModal } from "./reservation/EditReservationModal";
import { getToken, getRole } from "../utils/token";

const MainNavbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reservationList, loading } = useSelector((state: RootState) => state.reservation);
  const tokenRedux = useSelector((state: RootState) => state.auth.token);
  const roleRedux = useSelector((state: RootState) => state.auth.role);

  // fallback sui cookie
  const token = tokenRedux || getToken();
  const role = roleRedux || getRole();

  const isAuthenticated = Boolean(token);
  const isCustomer = role === "Customer";
  const isStaff = role === "Receptionist" || role === "RoomStaff";
  const isAdmin = role === "Admin";

  const [query, setQuery] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  //Handle
  const handleHotelClick = () => {
    if (!isAuthenticated || isCustomer) window.location.href = "/";
    else window.location.href = "/calendar";
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const searchDto: ReservationSearchDto = {};
    if (trimmed.includes("@")) searchDto.email = trimmed;
    else if (/^\+?\d+$/.test(trimmed)) searchDto.phone = trimmed;
    else searchDto.customerName = trimmed;

    dispatch(searchReservationList(searchDto));
  };

  const handleResultClick = (id: string) => {
    setSelectedReservationId(id);
    setShowEditModal(true);
    dispatch(fetchReservationById(id));
    setQuery("");
    dispatch(clearSearch());
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        dispatch(clearSearch());
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

  return (
    <>
      <Navbar bg="light" expand="lg" className="border-bottom">
        <Container fluid>
          <Navbar.Brand role="button" className="fw-bold" onClick={handleHotelClick}>
            Hotel Paradise
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              {isCustomer && <Nav.Link disabled>Le mie prenotazioni</Nav.Link>}
              {(isStaff || isAdmin) && <Nav.Link href="/calendar">Calendario</Nav.Link>}
              {isAdmin && (
                <>
                  <Nav.Link href="/rooms">Rooms</Nav.Link>
                  <Nav.Link disabled>Invoices</Nav.Link>
                </>
              )}
            </Nav>

            {(isStaff || isAdmin) && (
              <div ref={dropdownRef} className="position-relative d-flex me-3">
                <Form className="d-flex w-100" onSubmit={handleSearch}>
                  <InputGroup>
                    <FormControl placeholder="Cerca prenotazione" value={query} onChange={(e) => setQuery(e.target.value)} />
                    <Button type="submit">Cerca</Button>
                  </InputGroup>
                </Form>

                {loading && <Spinner animation="border" size="sm" className="ms-2 position-absolute top-50 translate-middle-y" />}

                {reservationList.length > 0 && query.trim() && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {reservationList.map((res: ReservationListDto) => (
                      <div key={res.id} style={{ padding: "5px 10px", cursor: "pointer" }} onClick={() => handleResultClick(res.id)}>
                        {res.customerName} - {res.roomNumber} ({new Date(res.checkIn).toLocaleDateString()})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Nav>
              {!isAuthenticated && (
                <>
                  <Nav.Link disabled>Registrati</Nav.Link>
                  <Nav.Link href="/login">Login</Nav.Link>
                </>
              )}
              {isAuthenticated && <Nav.Link onClick={handleLogout}>Logout</Nav.Link>}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <EditReservationModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        reservationId={selectedReservationId}
        onUpdated={() => {
          window.dispatchEvent(new CustomEvent("refreshCalendar"));
        }}
      />
    </>
  );
};

export default MainNavbar;
