import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store/store";
import { useState } from "react";
import { login } from "../redux/actions/authActions";
import { Navigate } from "react-router";
import { Alert, Button, Container, Form } from "react-bootstrap";

export const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, isAuthenticated, user, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const dto = { email, password }; //messo qui perchè LoginDto è composto così
    dispatch(login(dto));
  };

  //a seconda del ruolo un redirect diverso
  if (isAuthenticated) {
    const role = user?.role ?? "";
    if (["Admin", "Receptionist", "RoomStaff"].includes(role)) {
      return <Navigate to="/crm" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <Container className="d-flex vh-100 justify-content-center align-items-center">
      <Form onSubmit={handleSubmit} style={{ width: 350 }}>
        <h3 className="mb-4 text-center">Login</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3">
          <Form.Control
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button type="submit" className="w-100" disabled={loading}>
          {loading ? "Access..." : "Log in"}
        </Button>
      </Form>
    </Container>
  );
};
