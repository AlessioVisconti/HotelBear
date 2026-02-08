import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { logout } from "../redux/features/auth/authSlice";

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { username, email, firstName, lastName, role } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h3>Dashboard</h3>
            </Card.Header>
            <Card.Body>
              <p>
                <strong>Nome:</strong> {firstName} {lastName}
              </p>
              <p>
                <strong>Username:</strong> {username}
              </p>
              <p>
                <strong>Email:</strong> {email}
              </p>
              <p>
                <strong>Ruolo:</strong> {role}
              </p>
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
