import React, { useEffect, useMemo, useState } from "react";
import { Container, Table, Spinner, Alert, InputGroup, FormControl } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { getRoomCalendar } from "../redux/features/calendar/calendarSlice";
import type { ReservationBarDto } from "../redux/features/calendar/calendarTypes";

import CreateReservationModal from "../components/reservation/CreateReservationModal";
import { EditReservationModal } from "../components/reservation/EditReservationModal";

const CalendarPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rooms, loading, error } = useSelector((state: RootState) => state.calendar);

  const [createModal, setCreateModal] = useState({
    show: false,
    roomId: "",
    checkIn: new Date(),
    checkOut: new Date(),
  });

  const [editModal, setEditModal] = useState({ show: false, reservationId: "" });

  const [calendarStart, setCalendarStart] = useState(new Date());
  const [start, setStart] = useState(new Date());

  const end = useMemo(() => {
    const d = new Date(start);
    d.setDate(start.getDate() + 31);
    return d;
  }, [start]);

  const days = useMemo(() => {
    const arr: Date[] = [];
    const d = new Date(start);
    while (d <= end) {
      arr.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return arr;
  }, [start, end]);

  const fetchCalendar = () => {
    const startDate = calendarStart.toISOString();
    const endDate = new Date(calendarStart);
    endDate.setDate(endDate.getDate() + 31);
    dispatch(getRoomCalendar({ startDate, endDate: endDate.toISOString() }));
  };

  useEffect(() => {
    fetchCalendar();
  }, [dispatch, calendarStart]);

  useEffect(() => {
    const handleRefresh = () => fetchCalendar();
    window.addEventListener("refreshCalendar", handleRefresh);
    return () => window.removeEventListener("refreshCalendar", handleRefresh);
  }, [calendarStart]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  //Handle
  const handleCellClick = (roomId: string, day: Date, reservation?: ReservationBarDto) => {
    if (reservation) {
      setEditModal({ show: true, reservationId: reservation.reservationId.toString() });
    } else {
      const checkInDate = new Date(day);
      const checkOutDate = new Date(day);
      checkOutDate.setDate(checkOutDate.getDate() + 1);
      setCreateModal({ show: true, roomId, checkIn: checkInDate, checkOut: checkOutDate });
    }
  };

  const handleDayHeaderClick = (day: Date) => {
    setCalendarStart(day);
    setStart(day);
  };

  const handleCalendarRefresh = () => {
    fetchCalendar();
  };

  return (
    <Container className="mt-5">
      <h2 style={{ textTransform: "uppercase" }}>Room Calendar</h2>

      <div className="d-flex mb-3 align-items-center flex-wrap">
        <InputGroup style={{ maxWidth: "200px" }} className="mb-2">
          <FormControl
            type="date"
            value={start.toISOString().split("T")[0]}
            onChange={(e) => {
              const selected = new Date(e.target.value);
              if (!isNaN(selected.getTime())) {
                setStart(selected);
                setCalendarStart(selected);
              }
            }}
          />
        </InputGroup>
      </div>

      <div style={{ overflowX: "auto" }}>
        <Table bordered hover className="text-center">
          <thead>
            <tr>
              <th style={{ backgroundColor: "#e9ecef", position: "sticky", left: 0, zIndex: 2 }}>Room</th>
              {days.map((day) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <th
                    key={day.toDateString()}
                    style={{
                      backgroundColor: isWeekend ? "#d3d3d3" : "#f8f9fa",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      fontWeight: "normal",
                      cursor: "pointer",
                    }}
                    onClick={() => handleDayHeaderClick(day)}
                  >
                    {day.toLocaleDateString()}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.roomId}>
                <td style={{ backgroundColor: "#e9ecef", position: "sticky", left: 0, zIndex: 1 }}>
                  {room.roomNumber} - {room.roomName}
                </td>
                {days.map((day) => {
                  const dayReservation = room.reservations.find((r) => {
                    const checkIn = new Date(r.checkIn);
                    const checkOut = new Date(r.checkOut);
                    return day >= checkIn && day < checkOut;
                  });

                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const bgStyle = dayReservation
                    ? { backgroundColor: getReservationColor(dayReservation.status) }
                    : { backgroundColor: isWeekend ? "#d3d3d3" : "#f8f9fa" };

                  return (
                    <td
                      key={day.toDateString()}
                      style={{ ...bgStyle, cursor: "pointer", minWidth: "100px" }}
                      title={dayReservation?.guestName}
                      onClick={() => handleCellClick(room.roomId.toString(), day, dayReservation)}
                    >
                      {dayReservation ? dayReservation.guestName : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <CreateReservationModal
        show={createModal.show}
        onHide={() => setCreateModal({ ...createModal, show: false })}
        roomId={createModal.roomId}
        checkIn={createModal.checkIn}
        checkOut={createModal.checkOut}
        onCreated={handleCalendarRefresh}
      />

      <EditReservationModal
        show={editModal.show}
        onHide={() => setEditModal({ ...editModal, show: false })}
        reservationId={editModal.reservationId}
        onUpdated={handleCalendarRefresh}
      />
    </Container>
  );
};

const getReservationColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "#ffcc00";
    case "Confirmed":
      return "#28a745";
    case "Cancelled":
      return "#dc3545";
    case "CheckedIn":
      return "#007bff";
    case "CheckedOut":
      return "#6c757d";
    default:
      return "#f0f0f0";
  }
};

export default CalendarPage;
