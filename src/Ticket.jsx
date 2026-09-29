import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Ticket.css";

const Ticket = ({ bookingId }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const getTicket = async () => {
    try {
      const res = await axios.get(
        `http://localhost:6060/api/tickets/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setTicket(res.data.ticket);
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
        "Unable to load ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTicket();
  }, [bookingId]);

  if (loading) {
    return <h2>Loading Ticket...</h2>;
  }

  if (!ticket) {
    return <h2>Ticket not found</h2>;
  }

  const downloadQR = () => {
    const link = document.createElement("a");

    link.href = ticket.qrCode;
    link.download = `${ticket.ticketId}.png`;

    link.click();
  };

  return (
    <div className="ticket-page">

      <div className="ticket-card">

        <div className="ticket-header">
          <h1>🎬 CineBook</h1>
          <span>Movie Ticket</span>
        </div>

        <div className="ticket-body">

          <div className="ticket-info">

            <h2>
              {ticket.show?.movie?.title || "Movie"}
            </h2>

            <p>
              <strong>Ticket ID:</strong>{" "}
              {ticket.ticketId}
            </p>

            <p>
              <strong>Booking ID:</strong>{" "}
              {ticket.bookingId}
            </p>

            <p>
              <strong>Seats:</strong>{" "}
              {ticket.seats?.map((seat) =>
                `${seat.row}${seat.seatNumber}`
              ).join(", ")}
            </p>

            <p>
              <strong>Amount:</strong> ₹
              {ticket.totalAmount}
            </p>

            <p className="confirmed">
              ✓ Payment Confirmed
            </p>

          </div>

          <div className="qr-section">

            <img
              src={ticket.qrCode}
              alt="CineBook QR Code"
            />

            <p>Scan to verify ticket</p>

          </div>

        </div>

        <div className="ticket-actions">

          <button onClick={downloadQR}>
            Download QR
          </button>

          <button onClick={() => window.print()}>
            Print Ticket
          </button>

        </div>

      </div>

    </div>
  );
};

export default Ticket;