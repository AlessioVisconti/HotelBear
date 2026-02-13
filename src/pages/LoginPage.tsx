import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert, Spinner, Card, InputGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/features/auth/authSlice";
import type { AppDispatch, RootState } from "../redux/store";
import { useLocation } from "react-router-dom";

// Icons
import { BsEnvelope, BsLock, BsArrowRight } from "react-icons/bs";
import { RiHotelLine } from "react-icons/ri";

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
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={5} xl={4}>
            {/* Branding superiore */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle shadow-sm mb-3"
                style={{ width: "70px", height: "70px", backgroundColor: "var(--hotel-primary)", color: "white" }}
              >
                <RiHotelLine size={35} />
              </div>
              <h2 className="fw-bold text-dark">Welcome Back</h2>
              <p className="text-muted small">Please enter your credentials to access the portal</p>
            </div>

            {/* Card Login */}
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
              <div style={{ height: "5px", background: "var(--hotel-primary)" }}></div>
              <Card.Body className="p-4 p-md-5">
                {logoutMessage && (
                  <Alert variant="info" className="border-0 shadow-sm small rounded-3 mb-4">
                    You have been logged out due to inactivity.
                  </Alert>
                )}

                {error && (
                  <Alert variant="danger" className="border-0 shadow-sm small rounded-3 mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Email Address</Form.Label>
                    <InputGroup className="rounded-3 overflow-hidden border">
                      <InputGroup.Text className="bg-white border-0 text-muted">
                        <BsEnvelope />
                      </InputGroup.Text>
                      <Form.Control
                        className="border-0 py-2 ps-0"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ boxShadow: "none" }}
                      />
                    </InputGroup>
                  </Form.Group>

                  {/* Password Field */}
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Password</Form.Label>
                    <InputGroup className="rounded-3 overflow-hidden border">
                      <InputGroup.Text className="bg-white border-0 text-muted">
                        <BsLock />
                      </InputGroup.Text>
                      <Form.Control
                        className="border-0 py-2 ps-0"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ boxShadow: "none" }}
                      />
                    </InputGroup>
                  </Form.Group>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{
                      backgroundColor: "var(--hotel-primary)",
                      border: "none",
                      borderRadius: "10px",
                      letterSpacing: "0.5px",
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        LOGIN <BsArrowRight />
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>

              <div className="bg-light py-3 border-top text-center">
                <small className="text-muted">Secure Access Portal • Hotel Management</small>
              </div>
            </Card>

            <div className="text-center mt-4">
              <small className="text-muted">© 2024 Hotel Bear. All rights reserved.</small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
