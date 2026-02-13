import React, { useState, useMemo, useCallback } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { createPayment, updatePayment } from "../../redux/features/payment/paymentSlice";

import type { RootState, AppDispatch } from "../../redux/store";
import type { PaymentDto, PaymentType } from "../../redux/features/payment/paymentTypes";

interface PaymentFormProps {
  reservationId: string;
  payment?: PaymentDto | null;
  onSaved: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ reservationId, payment, onSaved }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { methods, loading } = useSelector((state: RootState) => state.paymentMethod);
  const activeMethods = useMemo(() => methods.filter((m) => m.isActive), [methods]);

  const initialFormData = useMemo(() => {
    return {
      amount: payment?.amount ?? 0,
      type: payment?.type ?? ("Deposit" as PaymentType),
      paymentMethodId:
        payment?.paymentMethodId && activeMethods.find((m) => m.id === payment.paymentMethodId) ? payment.paymentMethodId : (activeMethods[0]?.id ?? ""),
    };
  }, [payment, activeMethods]);

  const [amount, setAmount] = useState(initialFormData.amount);
  const [type, setType] = useState<PaymentType>(initialFormData.type);
  const [paymentMethodId, setPaymentMethodId] = useState(initialFormData.paymentMethodId);
  const [error, setError] = useState<string>("");

  // Block form if payment is already invoiced
  const isBlocked = payment?.isInvoiced ?? false;

  const handleSave = useCallback(async () => {
    if (isBlocked) return;
    setError("");

    if (!paymentMethodId) {
      setError("Select a payment method");
      return;
    }

    try {
      if (payment?.id) {
        // Update
        await dispatch(
          updatePayment({
            id: payment.id,
            dto: { amount, type, paymentMethodId },
          }),
        ).unwrap();
      } else {
        // Create
        await dispatch(createPayment({ reservationId, amount, type, paymentMethodId })).unwrap();
      }

      onSaved();
    } catch {
      setError("Error saving payment");
    }
  }, [dispatch, payment, reservationId, amount, type, paymentMethodId, onSaved, isBlocked]);

  // Spinner
  if (loading) return <Spinner animation="border" />;

  return (
    <div className="border p-3 mb-3 rounded shadow-sm">
      {error && <Alert variant="danger">{error}</Alert>}
      {isBlocked && <Alert variant="warning">This payment is already invoiced and cannot be edited.</Alert>}

      <h6>{payment ? "Edit Payment" : "Add Payment"}</h6>

      <Form.Group className="mb-2">
        <Form.Label>Amount</Form.Label>
        <Form.Control type="number" value={amount} onChange={(e) => !isBlocked && setAmount(Number(e.target.value))} disabled={isBlocked} />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Type</Form.Label>
        <Form.Select value={type} onChange={(e) => !isBlocked && setType(e.target.value as PaymentType)} disabled={isBlocked}>
          <option value="Deposit">Deposit</option>
          <option value="Balance">Balance</option>
          <option value="Extra">Extra</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Payment Method</Form.Label>
        <Form.Select value={paymentMethodId} onChange={(e) => !isBlocked && setPaymentMethodId(e.target.value)} disabled={isBlocked}>
          <option value="">Select method...</option>
          {activeMethods.map((m) => (
            <option key={m.id} value={m.id}>
              {m.description}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="success" onClick={handleSave} disabled={isBlocked}>
          {payment ? "Update Payment" : "Save Payment"}
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm;
