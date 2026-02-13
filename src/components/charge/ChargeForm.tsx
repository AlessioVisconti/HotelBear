import React, { useState, useCallback, useMemo } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { createCharge, updateCharge } from "../../redux/features/charge/chargeSlice";
import type { ChargeDto } from "../../redux/features/charge/chargeTypes";
import type { AppDispatch } from "../../redux/store";

interface ChargeFormProps {
  charge?: ChargeDto | null;
  reservationId: string;
  onSaved: () => void;
}

const ChargeForm: React.FC<ChargeFormProps> = ({ charge, reservationId, onSaved }) => {
  const dispatch = useDispatch<AppDispatch>();

  const chargeTypes = useMemo(() => ["Food", "Drink", "Minibar", "RoomService", "Extra"] as const, []);

  const initialData = useMemo<Partial<ChargeDto>>(
    () => ({
      id: charge?.id,
      reservationId,
      description: charge?.description || "",
      type: charge?.type || "Extra",
      unitPrice: charge?.unitPrice || 0,
      quantity: charge?.quantity || 1,
      vatRate: charge?.vatRate || 0,
      isInvoiced: charge?.isInvoiced || false,
    }),
    [charge, reservationId],
  );

  const [formData, setFormData] = useState<Partial<ChargeDto>>(initialData);
  const [error, setError] = useState("");

  const amount = useMemo(() => {
    const total = (formData.unitPrice || 0) * (formData.quantity || 0);
    return Math.round(total * 100) / 100;
  }, [formData.unitPrice, formData.quantity]);

  const handleChange = useCallback(<K extends keyof ChargeDto>(field: K, value: ChargeDto[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setError("");

    if (!formData.description?.trim()) {
      setError("Description is required");
      return;
    }

    try {
      const dto: ChargeDto = { ...(formData as ChargeDto), amount };

      if (formData.id) {
        await dispatch(updateCharge({ id: formData.id, dto })).unwrap();
      } else {
        await dispatch(createCharge(dto)).unwrap();
      }

      onSaved();
    } catch (err) {
      setError((err as Error).message || "Error saving charge");
    }
  }, [dispatch, formData, amount, onSaved]);

  return (
    <div className="border p-3 mb-3 rounded shadow-sm">
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-2">
        <Form.Label>Description</Form.Label>
        <Form.Control value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Type</Form.Label>
        <Form.Select value={formData.type || "Extra"} onChange={(e) => handleChange("type", e.target.value as ChargeDto["type"])}>
          {chargeTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Unit Price</Form.Label>
        <Form.Control type="number" value={formData.unitPrice || 0} onChange={(e) => handleChange("unitPrice", Number(e.target.value))} />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Quantity</Form.Label>
        <Form.Control type="number" value={formData.quantity || 1} onChange={(e) => handleChange("quantity", Number(e.target.value))} />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>VAT %</Form.Label>
        <Form.Control type="number" value={formData.vatRate || 0} onChange={(e) => handleChange("vatRate", Number(e.target.value))} />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Total Amount</Form.Label>
        <Form.Control type="number" value={amount.toFixed(2)} readOnly />
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="success" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default ChargeForm;
