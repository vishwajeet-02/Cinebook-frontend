import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const MyBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const getBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data);
    } catch (error) {
      console.log("Bookings Error:", error);

     
      if (error.response?.status === 401) {
  console.log("401 RESPONSE:", error.response?.data);
  alert(error.response?.data?.message || "Unauthorized");
  return;
}

      alert(
        error.response?.data?.message ||
          "Unable to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBookings();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <main className="bookings-page">

      {/* Header */}
      <section className="bookings-header">

        <span className="page-label">
          CINEBOOK
        </span>

        <h1>
          My <span>Bookings</span>
        </h1>

        <p>
          Your movie tickets, all in one place.
        </p>

      </section>

      {/* Bookings */}
      <section className="bookings-container">

        {bookings.length === 0 ? (
          <div className="booking-empty">

            <div className="empty-ticket-icon">
              🎟️
            </div>

            <h2>No bookings yet</h2>

            <p>
              Looks like you haven't booked a movie
              ticket yet.
            </p>

            <Link
              to="/"
              className="explore-movies-btn"
            >
              🎬 Explore Movies
            </Link>

          </div>
        ) : (
          <div className="booking-list">

            {bookings.map((booking) => {

              const movie =
                booking.show?.movie;

              const theatre =
                booking.show?.theatre;

              const seats =
                booking.seats || [];

              const showDate =
                booking.show?.showDate
                  ? new Date(
                      booking.show.showDate
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A";

              return (
                <div
                  className="premium-booking-card"
                  key={booking._id}
                >

                  {/* Movie Poster */}
                  <div className="booking-poster">

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

                  {/* Main Content */}
                  <div className="booking-content">

                    <div className="booking-top">

                      <div>
                        <span className="booking-label">
                          MOVIE TICKET
                        </span>

                        <h2>
                          {movie?.title ||
                            "Movie"}
                        </h2>
                      </div>

                      <span
                        className={`booking-status ${
                          booking.bookingStatus
                            ?.toLowerCase()
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>

                    </div>

                    <div className="booking-details">

                      <div className="booking-detail">
                        <span>THEATRE</span>
                        <strong>
                          🎦{" "}
                          {theatre?.name ||
                            "N/A"}
                        </strong>
                      </div>

                      <div className="booking-detail">
                        <span>DATE</span>
                        <strong>
                          📅 {showDate}
                        </strong>
                      </div>

                      <div className="booking-detail">
                        <span>TIME</span>
                        <strong>
                          🕐{" "}
                          {booking.show
                            ?.startTime ||
                            "N/A"}
                        </strong>
                      </div>

                      <div className="booking-detail">
                        <span>SEATS</span>
                        <strong>
                          💺{" "}
                          {seats
                            .map(
                              (seat) =>
                                `${seat.row}${seat.seatNumber}`
                            )
                            .join(", ") ||
                            "N/A"}
                        </strong>
                      </div>

                    </div>

                    {/* Bottom */}
                    <div className="booking-bottom">

                      <div>
                        <span className="booking-id">
                          Booking ID
                        </span>

                        <strong>
                          {booking._id}
                        </strong>
                      </div>

                      <div className="booking-price">
                        <span>
                          TOTAL
                        </span>

                        <strong>
                          ₹{booking.totalAmount}
                        </strong>
                      </div>

                      <div className="booking-actions">

                        {booking.paymentStatus ===
                          "Paid" && (
                          <Link
                            to={`/ticket/${booking._id}`}
                            className="view-ticket-btn"
                          >
                            🎟 View Ticket
                          </Link>
                        )}

                        {booking.paymentStatus !==
                          "Paid" &&
                          booking.bookingStatus !==
                            "Cancelled" && (
                            <Link
                              to={`/payment/${booking._id}`}
                              className="pay-booking-btn"
                            >
                              💳 Complete Payment
                            </Link>
                          )}

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>

    </main>
  );
};

export default MyBookings;