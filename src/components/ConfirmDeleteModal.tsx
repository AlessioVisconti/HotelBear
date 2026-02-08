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
        <Modal.Title>Conferma eliminazione</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Sei sicuro di voler eliminare "<strong>{itemName}</strong>"?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Elimina
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDeleteModal;
