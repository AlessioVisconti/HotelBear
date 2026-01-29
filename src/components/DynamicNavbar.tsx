import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store/store";
import { performLogout } from "../redux/actions/authActions";
import { Link, useNavigate } from "react-router-dom";

export const DynamicNavbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const isCrmRole = user?.role && ["Admin", "Receptionist", "RoomStaff"].includes(user.role);

  const handleLogout = () => {
    dispatch(performLogout());
    navigate("/login");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          HotelBear
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="dynamic-navbar-nav" />
        <Navbar.Collapse id="dynamic-navbar-nav">
          <Nav className="me-auto">
            {/* Utente non loggato */}
            {!isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}

            {/* Utente loggato ruolo Customer */}
            {isAuthenticated && !isCrmRole && <Nav.Link onClick={handleLogout}>Logout</Nav.Link>}

            {/* Utente loggato ruolo CRM */}
            {isAuthenticated && isCrmRole && (
              <>
                <Nav.Link as={Link} to="/crm">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/crm/reservations">
                  Prenotazioni
                </Nav.Link>
                <Nav.Link as={Link} to="/crm/rooms">
                  Camere
                </Nav.Link>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default DynamicNavbar;
