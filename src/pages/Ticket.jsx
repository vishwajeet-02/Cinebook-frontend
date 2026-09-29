import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const Ticket = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTicket = async () => {
      try {
        const res = await api.get(`/tickets/${bookingId}`);
        setTicket(res.data.ticket);
      } catch (error) {
        console.log("Ticket Error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        alert(
          error.response?.data?.message ||
            "Unable to load ticket"
        );
      } finally {
        setLoading(false);
      }
    };

    getTicket();
  }, [bookingId, navigate]);

  // Loading
  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader"></div>
        <p>Generating your ticket...</p>
      </div>
    );
  }

  // Ticket not found
  if (!ticket) {
    return (
      <main className="page-container">
        <h2>Ticket not found</h2>

        <button onClick={() => navigate("/")}>
          Go Home
        </button>
      </main>
    );
  }

  const movie = ticket.movie || ticket.show?.movie;
  const show = ticket.show;

  const showDate = show?.showDate
    ? new Date(show.showDate).toLocaleDateString(
        "en-IN",
        {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "N/A";

  const seats =
    ticket.seats
      ?.map((seat) => `${seat.row}${seat.seatNumber}`)
      .join(", ") || "N/A";

  // Download QR
  const downloadQR = () => {
    const link = document.createElement("a");

    link.href = ticket.qrCode;
    link.download = `${ticket.ticketId}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="ticket-page">

      {/* Header */}
      <section className="ticket-page-header">
        <span className="page-label">
          CINEBOOK
        </span>

        <h1>
          Your Movie <span>Ticket</span>
        </h1>

        <p>
          Your booking has been confirmed successfully.
        </p>
      </section>

      {/* Ticket */}
      <section className="cinema-ticket">

        {/* Ticket Top */}
        <div className="ticket-top">

          <div className="ticket-brand">
            <div className="ticket-logo">
              🎬
            </div>

            <div>
              <h2>
                Cine<span>Book</span>
              </h2>

              <p>Movie Ticket</p>
            </div>
          </div>

          <div className="ticket-confirmed">
            ✓ CONFIRMED
          </div>

        </div>


        {/* Movie Section */}
        <div className="ticket-movie">

          <div className="ticket-movie-poster">

            {movie?.poster ? (
              <img
                src={movie.poster}
                alt={movie.title}
              />
            ) : (
              <div className="ticket-poster-placeholder">
                🎬
              </div>
            )}

          </div>


          <div className="ticket-movie-info">

            <span>MOVIE</span>

            <h1>
              {movie?.title || "Movie"}
            </h1>

            <div className="ticket-tags">

              {movie?.genre && (
                <span>{movie.genre}</span>
              )}

              {movie?.language && (
                <span>{movie.language}</span>
              )}

              {movie?.duration && (
                <span>
                  ⏱ {movie.duration} min
                </span>
              )}

            </div>

          </div>

        </div>


        {/* Dashed Divider */}
        <div className="ticket-divider">
          <span></span>
          <span></span>
        </div>


        {/* Show Details */}
        <div className="ticket-details">

          <div className="ticket-detail-item">
            <span>THEATRE</span>

            <strong>
              🎦{" "}
              {show?.theatre?.name ||
                "Cineplex"}
            </strong>

            <small>
              {show?.theatre?.city || ""}
            </small>
          </div>


          <div className="ticket-detail-item">
            <span>DATE</span>

            <strong>
              📅 {showDate}
            </strong>
          </div>


          <div className="ticket-detail-item">
            <span>TIME</span>

            <strong>
              🕐 {show?.startTime || "N/A"}
            </strong>

            <small>
              {show?.format || "2D"}
            </small>
          </div>


          <div className="ticket-detail-item">
            <span>SCREEN</span>

            <strong>
              🎞️{" "}
              {show?.screen?.name ||
                "Screen"}
            </strong>
          </div>

        </div>


        {/* Bottom Section */}
        <div className="ticket-bottom">

          {/* Seats */}
          <div className="ticket-seat-box">

            <span>SEATS</span>

            <strong>
              💺 {seats}
            </strong>

          </div>


          {/* Amount */}
          <div className="ticket-amount-box">

            <span>TOTAL PAID</span>

            <strong>
              ₹{ticket.totalAmount}
            </strong>

          </div>

        </div>


        {/* QR Section */}
        <div className="ticket-qr-section">

          <div className="qr-info">

            <h3>
              Scan to Verify Ticket
            </h3>

            <p>
              Show this QR code at the
              theatre entrance.
            </p>

            <div className="ticket-id">

              <span>Ticket ID</span>

              <strong>
                {ticket.ticketId}
              </strong>

            </div>

          </div>


          <div className="qr-code">

            <img
              src={ticket.qrCode}
              alt="CineBook Ticket QR Code"
            />

          </div>

        </div>


        {/* Actions */}
        <div className="ticket-actions">

          <button
            className="download-ticket-btn"
            onClick={downloadQR}
          >
            📥 Download QR
          </button>

          <button
            className="print-ticket-btn"
            onClick={() => window.print()}
          >
            🖨 Print Ticket
          </button>

          <button
            className="home-ticket-btn"
            onClick={() => navigate("/")}
          >
            🎬 Back to Home
          </button>

        </div>

      </section>

    </main>
  );
};

export default Ticket;