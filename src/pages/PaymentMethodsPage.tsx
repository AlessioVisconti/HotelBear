import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Container, Table, Button, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { RootState, AppDispatch } from "../redux/store";
import { fetchPaymentMethods } from "../redux/features/paymentMethod/paymentMethodSlice";
import type { PaymentMethodDto } from "../redux/features/paymentMethod/paymentMethodTypes";
import PaymentMethodModal from "../components/paymentMethod/paymentMethodModal";
import { logout } from "../redux/features/auth/authSlice";
import { BsPencilFill } from "react-icons/bs";

const PaymentMethodsPage: React.FC = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { methods, loading } = useSelector((state: RootState) => state.paymentMethod);
  const { role, token } = useSelector((state: RootState) => state.auth);

  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Controller role for Admin
  useEffect(() => {
    if (!token || role !== "Admin") {
      dispatch(logout());
      navigate("/", { replace: true });
    }
  }, [token, role, dispatch, navigate]);

  useEffect(() => {
    dispatch(fetchPaymentMethods());
  }, [dispatch]);

  // Handle
  const handleEditClick = useCallback((id: string) => {
    setSelectedMethodId(id);
    setShowModal(true);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setSelectedMethodId(null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const methodsTable = useMemo(() => {
    return methods.map((m: PaymentMethodDto) => (
      <tr key={m.id}>
        <td>{m.code}</td>
        <td>{m.description}</td>
        <td>{m.isActive ? "Active" : "Disabled"}</td>
        <td className="text-end">
          <Button size="sm" variant="outline-primary" onClick={() => handleEditClick(m.id)}>
            <BsPencilFill />
          </Button>
        </td>
      </tr>
    ));
  }, [methods, handleEditClick]);

  return (
    <Container className="mt-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Payment Method Management</h2>
        <Button variant="success" onClick={handleOpenCreateModal}>
          + Add Method
        </Button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center mt-4">
          <Spinner animation="border" />
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>State</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>{methodsTable}</tbody>
        </Table>
      )}

      {/* MODAL */}
      <PaymentMethodModal
        show={showModal}
        methodId={selectedMethodId}
        onHide={handleCloseModal}
        onSaved={useCallback(() => dispatch(fetchPaymentMethods()), [dispatch])}
      />
    </Container>
  );
});

export default PaymentMethodsPage;
