import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/features/auth/authSlice";
import type { AppDispatch, RootState } from "../redux/store";
import { useLocation } from "react-router-dom";

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const location = useLocation();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logoutMessage, setLogoutMessage] = useState(false);

  useEffect(() => {
    if (location.state?.loggedOut) {
      const showTimer = setTimeout(() => setLogoutMessage(true), 0);
      const hideTimer = setTimeout(() => setLogoutMessage(false), 5000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [location.state]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="mb-4">Login</h2>

          {logoutMessage && <Alert variant="info">Sei stato disconnesso per inattività</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Inserisci email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>

            <Button type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Login"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
