import React from "react";
import { Modal, Button } from "react-bootstrap";

interface ConfirmDeleteModalProps {
  show: boolean;
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ show, itemName, onCancel, onConfirm }) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete? "<strong>{itemName}</strong>"?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDeleteModal;
