import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../services/api";

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadSeatData = async () => {
      try {
        const [showRes, seatRes] = await Promise.all([
          api.get(`/shows/${showId}`),
          // CHANGED: was api.get("/seats") -- fetched every seat in the DB
          // with no idea what was already booked for this show.
          // Now hits the per-show endpoint that returns isBooked per seat.
          api.get(`/seats/show/${showId}`),
        ]);

        setShow(showRes.data);
        setSeats(seatRes.data);
      } catch (error) {
        console.log("Seat Selection Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSeatData();
  }, [showId]);

  const toggleSeat = (seat) => {
    // CHANGED: never allow toggling a seat that's already booked
    if (seat.isBooked) return;

    const alreadySelected = selectedSeats.some(
      (selected) => selected._id === seat._id
    );

    if (alreadySelected) {
      setSelectedSeats(
        selectedSeats.filter(
          (selected) => selected._id !== seat._id
        )
      );
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const totalAmount = selectedSeats.reduce(
    (total, seat) => total + Number(seat.price || 0),
    0
  );

  const groupedSeats = seats.reduce((groups, seat) => {
    if (!groups[seat.row]) {
      groups[seat.row] = [];
    }
    groups[seat.row].push(seat);
    return groups;
  }, {});

  const sortedRows = Object.keys(groupedSeats).sort();

  const proceedToBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    // NEW: check login before ever hitting the API. Previously this
    // went straight to api.post("/bookings"), which failed with a
    // raw "token required" alert for guests. Now they're sent to
    // login first, and land back on this exact seat page afterward
    // (via location.state.from, same pattern as ProtectedRoute).
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to continue booking your seats.");
      navigate("/login", { state: { from: location } });
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/bookings", {
        show: showId,
        seats: selectedSeats.map((seat) => seat._id),
      });

      const bookingId = response.data.booking?._id;

      if (!bookingId) {
        alert("Booking ID not received");
        return;
      }

      navigate(`/payment/${bookingId}`);
    } catch (error) {
      console.log("Booking Error:", error);

      // CHANGED: a 409 here means someone else grabbed the seat
      // between the time it loaded and the time you clicked "book".
      // Refresh seat data so the UI reflects reality instead of
      // just showing a dead-end alert.
      if (error.response?.status === 409) {
        alert(
          error.response?.data?.message ||
            "One of your selected seats was just booked by someone else."
        );

        try {
          const seatRes = await api.get(`/seats/show/${showId}`);
          setSeats(seatRes.data);
          setSelectedSeats([]);
        } catch (refreshError) {
          console.log("Seat refresh error:", refreshError);
        }
      } else {
        alert(
          error.response?.data?.message || "Unable to create booking"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader"></div>
        <p>Preparing your seats...</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="page-container">
        <h2>Show not found</h2>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <main className="seat-selection-page">
      <section className="seat-header">
        <div>
          <span className="page-label">CINEBOOK • SEAT SELECTION</span>
          <h1>
            Choose your <span>seats</span>
          </h1>
          <p>Select your favourite seats and continue to booking.</p>
        </div>

        <div className="seat-show-summary">
          <strong>{show.movie?.title || "Movie"}</strong>
          <span>{show.theatre?.name || "Theatre"}</span>
          <small>
            {show.startTime} • {show.format || "2D"}
          </small>
        </div>
      </section>

      <section className="cinema-area">
        <div className="cinema-screen">
          <div className="screen-glow"></div>
          <span>SCREEN</span>
        </div>

        <p className="screen-text">All eyes this way</p>

        <div className="seat-layout">
          {seats.length === 0 ? (
            <div className="empty-seats">
              <h2>No seats available</h2>
              <p>Seats have not been configured for this screen.</p>
            </div>
          ) : (
            sortedRows.map((row) => {
              const rowSeats = groupedSeats[row].sort(
                (a, b) => a.seatNumber - b.seatNumber
              );

              return (
                <div className="seat-row" key={row}>
                  <span className="row-label">{row}</span>

                  <div className="row-seats">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeats.some(
                        (selected) => selected._id === seat._id
                      );

                      return (
                        <button
                          key={seat._id}
                          className={`
                            seat
                            ${seat.seatType?.toLowerCase() || "regular"}
                            ${isSelected ? "selected" : ""}
                            ${seat.isBooked ? "booked" : ""}
                          `}
                          onClick={() => toggleSeat(seat)}
                          disabled={seat.isBooked}
                          title={
                            seat.isBooked
                              ? "Already booked"
                              : `${seat.row}${seat.seatNumber} • ${seat.seatType} • ₹${seat.price}`
                          }
                        >
                          {seat.seatNumber}
                        </button>
                      );
                    })}
                  </div>

                  <span className="row-label">{row}</span>
                </div>
              );
            })
          )}
        </div>

        <div className="seat-legend">
          <div>
            <span className="legend-seat available"></span>
            Available
          </div>
          <div>
            <span className="legend-seat selected"></span>
            Selected
          </div>
          <div>
            <span className="legend-seat booked"></span>
            Booked
          </div>
          <div>
            <span className="legend-seat premium"></span>
            Premium
          </div>
          <div>
            <span className="legend-seat vip"></span>
            VIP
          </div>
        </div>
      </section>

      <section className="booking-summary">
        <div className="selected-info">
          <span>Selected Seats</span>
          <strong>
            {selectedSeats.length === 0
              ? "None"
              : selectedSeats
                  .map((seat) => `${seat.row}${seat.seatNumber}`)
                  .join(", ")}
          </strong>
        </div>

        <div className="selected-count">
          <span>Seats</span>
          <strong>{selectedSeats.length}</strong>
        </div>

        <div className="total-price">
          <span>Total Amount</span>
          <strong>₹{totalAmount}</strong>
        </div>

        <button
          className="proceed-booking-btn"
          onClick={proceedToBooking}
          disabled={selectedSeats.length === 0 || submitting}
        >
          {submitting ? "Booking..." : "Proceed to Booking"}
          <span>→</span>
        </button>
      </section>
    </main>
  );
};

export default SeatSelection;
