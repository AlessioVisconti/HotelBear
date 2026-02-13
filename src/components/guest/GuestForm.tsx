import React, { useState, useCallback, useMemo } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { createGuest, updateGuest } from "../../redux/features/guest/guestSlice";
import type { GuestDto } from "../../redux/features/guest/guestTypes";
import type { AppDispatch } from "../../redux/store";

interface GuestFormProps {
  guest?: GuestDto | null;
  reservationId: string;
  onSaved: () => void;
}

const GuestForm: React.FC<GuestFormProps> = ({ guest, reservationId, onSaved }) => {
  const dispatch = useDispatch<AppDispatch>();

  const mainRoles = useMemo(() => ["Single", "HeadOfFamily", "GroupLeader"], []);

  const initialFormData = useMemo<Partial<GuestDto>>(
    () => ({
      id: guest?.id,
      reservationId,
      firstName: guest?.firstName || "",
      lastName: guest?.lastName || "",
      role: guest?.role || "Single",

      birthDate: guest?.birthDate,
      birthCity: guest?.birthCity,
      citizenship: guest?.citizenship,
      cityOfResidence: guest?.cityOfResidence,

      taxCode: guest?.taxCode,
      address: guest?.address,
      province: guest?.province,
      postalCode: guest?.postalCode,

      documentType: guest?.documentType,
      documentNumber: guest?.documentNumber,
      documentExpiration: guest?.documentExpiration,
    }),
    [guest, reservationId],
  );

  const [formData, setFormData] = useState<Partial<GuestDto>>(initialFormData);

  const [error, setError] = useState<string>("");

  //Handle
  const handleChange = useCallback(<K extends keyof GuestDto>(field: K, value: GuestDto[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const showExtra = useMemo(() => {
    return formData.role ? mainRoles.includes(formData.role) : false;
  }, [formData.role, mainRoles]);

  const handleSave = useCallback(async () => {
    setError("");

    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      setError("First and Last Name are required");
      return;
    }

    if (formData.role && mainRoles.includes(formData.role)) {
      const requiredFields: (keyof GuestDto)[] = [
        "birthDate",
        "birthCity",
        "citizenship",
        "cityOfResidence",
        "taxCode",
        "address",
        "province",
        "postalCode",
        "documentType",
        "documentNumber",
        "documentExpiration",
      ];

      for (const field of requiredFields) {
        if (!formData[field]) {
          setError(`Field "${field}" is required for ${formData.role}`);
          return;
        }
      }
    } else {
      const baseFields: (keyof GuestDto)[] = ["birthDate", "birthCity", "citizenship", "cityOfResidence"];

      for (const field of baseFields) {
        if (!formData[field]) {
          setError(`Field "${field}" is required for ${formData.role}`);
          return;
        }
      }
    }

    try {
      if (guest?.id) {
        await dispatch(updateGuest({ id: guest.id, dto: formData as GuestDto })).unwrap();
      } else {
        await dispatch(createGuest(formData as GuestDto)).unwrap();
      }

      onSaved();
    } catch {
      setError("Error saving guest");
    }
  }, [dispatch, formData, guest, mainRoles, onSaved]);

  return (
    <div className="border p-3 mb-3 rounded shadow-sm">
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-2">
        <Form.Label>Name</Form.Label>
        <Form.Control value={formData.firstName || ""} onChange={(e) => handleChange("firstName", e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Last Name</Form.Label>
        <Form.Control value={formData.lastName || ""} onChange={(e) => handleChange("lastName", e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Role</Form.Label>
        <Form.Select value={formData.role || "Single"} onChange={(e) => handleChange("role", e.target.value)}>
          <option value="Single">Single</option>
          <option value="HeadOfFamily">HeadOfFamily</option>
          <option value="FamilyMember">FamilyMember</option>
          <option value="GroupLeader">GroupLeader</option>
          <option value="GroupMember">GroupMember</option>
        </Form.Select>
      </Form.Group>

      {/* Base fields */}
      <Form.Group className="mb-2">
        <Form.Label>Birth Date</Form.Label>
        <Form.Control type="date" value={formData.birthDate?.split("T")[0] || ""} onChange={(e) => handleChange("birthDate", e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Birth City</Form.Label>
        <Form.Control value={formData.birthCity || ""} onChange={(e) => handleChange("birthCity", e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Citizenship</Form.Label>
        <Form.Control value={formData.citizenship || ""} onChange={(e) => handleChange("citizenship", e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>City of Residence</Form.Label>
        <Form.Control value={formData.cityOfResidence || ""} onChange={(e) => handleChange("cityOfResidence", e.target.value)} />
      </Form.Group>

      {/* Extra fields */}
      {showExtra && (
        <>
          <Form.Group className="mb-2">
            <Form.Label>Tax Code</Form.Label>
            <Form.Control value={formData.taxCode || ""} onChange={(e) => handleChange("taxCode", e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Address</Form.Label>
            <Form.Control value={formData.address || ""} onChange={(e) => handleChange("address", e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Province</Form.Label>
            <Form.Control value={formData.province || ""} onChange={(e) => handleChange("province", e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Postal Code</Form.Label>
            <Form.Control value={formData.postalCode || ""} onChange={(e) => handleChange("postalCode", e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Document Type</Form.Label>
            <Form.Select value={formData.documentType || ""} onChange={(e) => handleChange("documentType", e.target.value)}>
              <option value="">Seleziona</option>
              <option value="IdentityCard">Identity Card</option>
              <option value="Passport">Passport</option>
              <option value="DrivingLicense">Driving License</option>
              <option value="ResidencePermit">Residence Permit</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Document Number</Form.Label>
            <Form.Control value={formData.documentNumber || ""} onChange={(e) => handleChange("documentNumber", e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Document Expiration</Form.Label>
            <Form.Control
              type="date"
              value={formData.documentExpiration?.split("T")[0] || ""}
              onChange={(e) => handleChange("documentExpiration", e.target.value)}
            />
          </Form.Group>
        </>
      )}

      <div className="d-flex justify-content-end">
        <Button variant="success" onClick={handleSave}>
          Salva
        </Button>
      </div>
    </div>
  );
};

export default GuestForm;
