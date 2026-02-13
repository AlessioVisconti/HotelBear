import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { createPaymentMethod, updatePaymentMethod } from "../../redux/features/paymentMethod/paymentMethodSlice";
import type { PaymentMethodDto } from "../../redux/features/paymentMethod/paymentMethodTypes";
import type { AppDispatch, RootState } from "../../redux/store";

interface PaymentMethodModalProps {
  show: boolean;
  onHide: () => void;
  methodId?: string | null;
  onSaved?: () => void;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ show, onHide, methodId = null, onSaved }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { methods } = useSelector((state: RootState) => state.paymentMethod);

  const method = useMemo(() => methods.find((m) => m.id === methodId), [methods, methodId]);

  const initialFormData = useMemo<Partial<PaymentMethodDto>>(
    () => ({
      id: method?.id,
      code: method?.code || "",
      description: method?.description || "",
      isActive: method?.isActive ?? true,
    }),
    [method],
  );

  const [formData, setFormData] = useState<Partial<PaymentMethodDto>>(initialFormData);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  //Handle
  const handleChange = useCallback(<K extends keyof PaymentMethodDto>(field: K, value: PaymentMethodDto[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setError("");

    if (!formData.code?.trim() || !formData.description?.trim()) {
      setError("Code and description are required");
      return;
    }

    try {
      if (formData.id) {
        await dispatch(updatePaymentMethod({ id: formData.id, dto: formData as PaymentMethodDto })).unwrap();
      } else {
        await dispatch(createPaymentMethod(formData as PaymentMethodDto)).unwrap();
      }

      onSaved?.();
      onHide();
    } catch (err) {
      setError((err as Error).message || "Error saving payment method");
    }
  }, [dispatch, formData, onSaved, onHide]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{methodId ? "Edit Payment Method" : "Create Payment Method"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Code</Form.Label>
            <Form.Control value={formData.code || ""} onChange={(e) => handleChange("code", e.target.value)} placeholder="Enter Code" />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} placeholder="Enter description" />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Check type="checkbox" label="Attivo" checked={formData.isActive ?? true} onChange={(e) => handleChange("isActive", e.target.checked)} />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentMethodModal;
