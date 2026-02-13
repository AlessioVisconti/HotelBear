import React, { useState, useCallback, useMemo } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../redux/store";
import type { CreateStaffUserDto } from "../../redux/features/auth/authTypes";
import { registerStaff } from "../../redux/features/auth/authSlice";

interface Props {
  show: boolean;
  onHide: () => void;
}

const AddStaffModal: React.FC<Props> = React.memo(({ show, onHide }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const initialFormData = useMemo<CreateStaffUserDto>(
    () => ({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "Receptionist", // default
    }),
    [],
  );

  const [formData, setFormData] = useState<CreateStaffUserDto>(initialFormData);

  // Handle
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.email.trim() || !formData.password.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
      alert("All fields are required");
      return;
    }

    try {
      await dispatch(registerStaff(formData)).unwrap();
      alert("Staff account created successfully");
      setFormData(initialFormData);
      onHide();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error creating staff account";
      alert(message);
    }
  }, [dispatch, formData, initialFormData, onHide]);

  // Handle close
  const handleClose = useCallback(() => {
    setFormData(initialFormData);
    onHide();
  }, [initialFormData, onHide]);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>➕ Add Employee</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Label>First Name</Form.Label>
              <Form.Control name="firstName" value={formData.firstName} onChange={handleChange} />
            </Col>

            <Col>
              <Form.Label>Last Name</Form.Label>
              <Form.Control name="lastName" value={formData.lastName} onChange={handleChange} />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
            </Col>

            <Col>
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} />
            </Col>

            <Col>
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleChange}>
                <option value="Receptionist">Receptionist</option>
                <option value="RoomStaff">RoomStaff</option>
              </Form.Select>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>

        <Button variant="success" onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" animation="border" /> Creating...
            </>
          ) : (
            "Create Employee"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

export default AddStaffModal;
