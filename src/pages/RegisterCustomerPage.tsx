import React, { useState, useCallback, useMemo } from "react";
import { Container, Card, Form, Button, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../redux/store";
import type { RegisterCustomerDto } from "../redux/features/auth/authTypes";
import { registerCustomer } from "../redux/features/auth/authSlice";

const RegisterCustomerPage: React.FC = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();

  const { loading, token } = useSelector((state: RootState) => state.auth);

  const initialFormData = useMemo<RegisterCustomerDto>(
    () => ({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    }),
    [],
  );

  const [formData, setFormData] = useState<RegisterCustomerDto>(initialFormData);

  //Handle
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.email.trim() || !formData.password.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
        alert("All fields are required");
        return;
      }

      try {
        await dispatch(registerCustomer(formData)).unwrap();
        alert("Customer registered successfully");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error during registration";

        alert(message);
      }
    },
    [dispatch, formData],
  );

  // If already logged in -> dashboard
  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container className="mt-5" style={{ maxWidth: "500px" }}>
      <Card className="p-4 shadow-sm">
        <h2 className="fw-bold mb-3 text-center">Customer Registration</h2>

        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter your name" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter your last name" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Choose a secure password" />
          </Form.Group>

          <Button type="submit" variant="success" className="w-100" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" animation="border" /> Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </Form>
      </Card>
    </Container>
  );
});

export default RegisterCustomerPage;
