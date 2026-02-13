import React, { useState, useCallback, useEffect } from "react";
import { Container, Card, Button, Table, Badge, Spinner } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { getRole } from "../utils/token";

import AddStaffModal from "../components/staff/AddStaffModal";
import { Navigate } from "react-router";

import { getAllStaff, deactivateStaff, reactivateStaff } from "../redux/features/auth/authSlice";

import type { UserDto } from "../redux/features/auth/authTypes";

const StaffPage: React.FC = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const roleRedux = useSelector((state: RootState) => state.auth.role);
  const staffList = useSelector((state: RootState) => state.auth.staffList);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const role = roleRedux || getRole();
  const isAdmin = role === "Admin";
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (isAdmin) {
      dispatch(getAllStaff());
    }
  }, [dispatch, isAdmin]);

  //Handle
  const handleOpenModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    dispatch(getAllStaff());
  }, [dispatch]);

  const handleDeactivate = async (id: string) => {
    await dispatch(deactivateStaff(id));
    dispatch(getAllStaff());
  };

  const handleReactivate = async (id: string) => {
    await dispatch(reactivateStaff(id));
    dispatch(getAllStaff());
  };

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container className="mt-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Staff Management</h2>

        <Button variant="primary" onClick={handleOpenModal}>
          + Add employee
        </Button>
      </div>

      {/* STAFF TABLE */}
      <Card className="p-4 shadow-sm">
        <h5 className="fw-bold mb-3">Staff Accounts</h5>

        {loading && (
          <div className="text-center my-3">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && staffList.length === 0 && <p className="text-muted">No staff accounts found.</p>}

        {!loading && staffList.length > 0 && (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ width: "180px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {staffList.map((staff: UserDto) => (
                <tr key={staff.id}>
                  <td>
                    {staff.firstName} {staff.lastName}
                  </td>

                  <td>{staff.email}</td>

                  <td>{staff.role}</td>

                  <td>{staff.isActive ? <Badge bg="success">Active</Badge> : <Badge bg="danger">Inactive</Badge>}</td>

                  <td>
                    {staff.isActive ? (
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeactivate(staff.id)}>
                        Deactivate
                      </Button>
                    ) : (
                      <Button variant="outline-success" size="sm" onClick={() => handleReactivate(staff.id)}>
                        Reactivate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* MODALE */}
      <AddStaffModal show={showModal} onHide={handleCloseModal} />
    </Container>
  );
});

export default StaffPage;
