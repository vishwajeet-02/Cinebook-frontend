import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const ShowSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getShow = async () => {
      try {
        const res = await api.get(`/shows/${showId}`);
        setShow(res.data);
      } catch (error) {
        console.log("Show Error:", error);
      } finally {
        setLoading(false);
      }
    };

    getShow();
  }, [showId]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader"></div>
        <p>Loading show details...</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="page-container">
        <h2>Show not found</h2>

        <button onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  const movie = show.movie;
  const theatre = show.theatre;
  const screen = show.screen;

  const formattedDate = show.showDate
    ? new Date(show.showDate).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Date not available";

  return (
    <main className="show-selection-page">

      {/* Header */}
      <section className="show-header">

        <span className="page-label">
          CINEBOOK • SHOW DETAILS
        </span>

        <h1>
          Your <span>show</span> is ready
        </h1>

        <p>
          Review your show details before selecting your seats.
        </p>

      </section>

      {/* Show Card */}
      <section className="show-details-card">

        {/* Movie Poster */}
        <div className="show-movie-poster">

          {movie?.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
            />
          ) : (
            <div className="poster-placeholder">
              🎬
            </div>
          )}

        </div>

        {/* Details */}
        <div className="show-information">

          <span className="show-status">
            NOW SHOWING
          </span>

          <h2>
            {movie?.title || "Movie"}
          </h2>

          <p className="show-description">
            {movie?.description ||
              "Enjoy your movie experience with CineBook."}
          </p>

          {/* Info Grid */}
          <div className="show-info-grid">

            <div className="show-info-item">
              <span>📅 Date</span>
              <strong>{formattedDate}</strong>
            </div>

            <div className="show-info-item">
              <span>🕐 Time</span>
              <strong>
                {show.startTime} - {show.endTime}
              </strong>
            </div>

            <div className="show-info-item">
              <span>🎭 Format</span>
              <strong>
                {show.format || "2D"}
              </strong>
            </div>

            <div className="show-info-item">
              <span>🌐 Language</span>
              <strong>
                {show.language || "English"}
              </strong>
            </div>

            <div className="show-info-item">
              <span>🎦 Screen</span>
              <strong>
                {screen?.name || "Screen"}
              </strong>
            </div>

            <div className="show-info-item">
              <span>💺 Seats</span>
              <strong>
                {screen?.totalSeats || "N/A"}
              </strong>
            </div>

          </div>

          {/* Theatre */}
          <div className="selected-theatre">

            <div className="theatre-small-icon">
              🎦
            </div>

            <div>
              <span>THEATRE</span>

              <h3>
                {theatre?.name || "Theatre"}
              </h3>

              <p>
                📍 {theatre?.address || ""}
                {theatre?.city
                  ? `, ${theatre.city}`
                  : ""}
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* Price + Continue */}
      <section className="show-bottom">

        <div className="ticket-price">

          <span>Ticket Price</span>

          <strong>
            ₹{show.price}
          </strong>

          <small>
            per seat
          </small>

        </div>

        <button
          className="continue-seat-btn"
          onClick={() =>
            navigate(`/show/${show._id}/seats`)
          }
        >
          Select Seats
          <span>→</span>
        </button>

      </section>

    </main>
  );
};

export default ShowSelection;