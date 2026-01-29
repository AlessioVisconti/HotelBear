import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { registerCustomer } from "../redux/actions/authActions";
import type { RegisterCustomerDto } from "../redux/types/authTypes";
import { useNavigate, Navigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../redux/store/store";

export const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isAuthenticated, loading, user, error: authError } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<RegisterCustomerDto>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      await dispatch(registerCustomer(formData));
      navigate("/"); // redirect dopo registrazione
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Redirect se già loggato
  if (isAuthenticated) {
    const role = user?.role ?? "";
    if (["Admin", "Receptionist", "RoomStaff"].includes(role)) {
      return <Navigate to="/crm" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <Container style={{ maxWidth: "400px", marginTop: "2rem" }}>
      <h2>Customer Registration</h2>
      {(error || authError) && <Alert variant="danger">{error || authError}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
        </Form.Group>

        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Register"}
        </Button>
      </Form>
    </Container>
  );
};
