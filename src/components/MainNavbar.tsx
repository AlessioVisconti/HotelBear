import { useState, useRef, useEffect } from "react";
import { Navbar, Container, Nav, Form, FormControl, Button, InputGroup, Spinner, Badge, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { logout } from "../redux/features/auth/authSlice";
import { searchReservationList, fetchReservationById, clearSearch } from "../redux/features/reservation/reservationSlice";
import type { ReservationListDto, ReservationSearchDto } from "../redux/features/reservation/reservationTypes";
import { EditReservationModal } from "./reservation/EditReservationModal";
import { getToken, getRole } from "../utils/token";
import { BsSearch, BsCalendar3, BsPeople, BsBoxArrowRight } from "react-icons/bs";
import { RiHotelBedLine } from "react-icons/ri";
import { MdOutlinePayments } from "react-icons/md";

const MainNavbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reservationList, loading } = useSelector((state: RootState) => state.reservation);
  const tokenRedux = useSelector((state: RootState) => state.auth.token);
  const roleRedux = useSelector((state: RootState) => state.auth.role);

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
      <Navbar bg="white" expand="lg" className="py-3 shadow-sm sticky-top border-bottom">
        <Container fluid className="px-lg-5">
          {/* BRAND */}
          <Navbar.Brand
            role="button"
            className="d-flex align-items-center fw-bold fs-4 text-uppercase letter-spacing-1"
            onClick={handleHotelClick}
            style={{ color: "var(--hotel-primary)" }}
          >
            <RiHotelBedLine className="me-2" size={32} />
            <span>
              Hotel <span className="fw-light text-dark">Bear</span>
            </span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-nav" className="border-0 shadow-none" />

          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto mt-2 mt-lg-0 gap-lg-2">
              {isCustomer && (
                <Nav.Link disabled className="fw-medium px-3">
                  My Reservations
                </Nav.Link>
              )}

              {(isStaff || isAdmin) && (
                <Nav.Link href="/calendar" className="d-flex align-items-center fw-medium px-3">
                  <BsCalendar3 className="me-2" /> Calendar
                </Nav.Link>
              )}

              {isAdmin && (
                <>
                  <Nav.Link href="/rooms" className="d-flex align-items-center fw-medium px-3">
                    <RiHotelBedLine className="me-2" /> Rooms
                  </Nav.Link>
                  <Nav.Link href="/payment-methods" className="d-flex align-items-center fw-medium px-3">
                    <MdOutlinePayments className="me-2" /> Payments
                  </Nav.Link>
                  <Nav.Link href="/staff" className="d-flex align-items-center fw-medium px-3">
                    <BsPeople className="me-2" /> Staff
                  </Nav.Link>
                </>
              )}
            </Nav>

            {/* SEARCH SECTION FOR STAFF/ADMIN */}
            {(isStaff || isAdmin) && (
              <div ref={dropdownRef} className="position-relative me-lg-4 my-3 my-lg-0" style={{ minWidth: "300px" }}>
                <Form className="d-flex" onSubmit={handleSearch}>
                  <InputGroup className="bg-light rounded-pill overflow-hidden border">
                    <InputGroup.Text className="bg-light border-0 ps-3">
                      {loading ? <Spinner animation="border" size="sm" variant="primary" /> : <BsSearch className="text-muted" />}
                    </InputGroup.Text>
                    <FormControl
                      placeholder="Search booking..."
                      className="bg-light border-0 shadow-none py-2"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button variant="dark" type="submit" className="px-4 fw-bold" style={{ borderRadius: "0 50px 50px 0" }}>
                      Find
                    </Button>
                  </InputGroup>
                </Form>

                {/* DROPDOWN RESULTS */}
                {reservationList.length > 0 && query.trim() && (
                  <Card className="position-absolute shadow-lg border-0 mt-2 w-100 rounded-4 overflow-hidden" style={{ zIndex: 1050, maxHeight: "300px" }}>
                    <div className="list-group list-group-flush">
                      {reservationList.map((res: ReservationListDto) => (
                        <div
                          key={res.id}
                          className="list-group-item list-group-item-action border-0 py-3 px-4 d-flex justify-content-between align-items-center"
                          role="button"
                          onClick={() => handleResultClick(res.id)}
                        >
                          <div>
                            <div className="fw-bold text-dark">{res.customerName}</div>
                            <div className="small text-muted">
                              Room {res.roomNumber} • {new Date(res.checkIn).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge bg="primary" pill className="bg-opacity-10 text-primary border border-primary-subtle">
                            Edit
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* AUTH ACTIONS */}
            <Nav className="align-items-center gap-2">
              {!isAuthenticated ? (
                <>
                  <Nav.Link href="/register" className="fw-bold px-3">
                    Register
                  </Nav.Link>
                  <Button
                    href="/login"
                    variant="primary"
                    className="rounded-pill px-4 fw-bold shadow-sm"
                    style={{ backgroundColor: "var(--hotel-primary)", border: "none" }}
                  >
                    Login
                  </Button>
                </>
              ) : (
                <div className="d-flex align-items-center">
                  <div className="d-none d-xl-block text-end me-3">
                    <div className="small fw-bold text-dark lh-1">{role} Account</div>
                    <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
                      Online
                    </div>
                  </div>
                  <Button variant="outline-danger" onClick={handleLogout} className="rounded-pill d-flex align-items-center gap-2 px-3 fw-bold btn-sm border-2">
                    <BsBoxArrowRight size={18} /> Logout
                  </Button>
                </div>
              )}
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
