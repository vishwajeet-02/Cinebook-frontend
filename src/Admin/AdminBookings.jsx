
import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Bookings.css";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // ========================================
  // FETCH ALL BOOKINGS
  // ========================================

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await api.get("/bookings/admin");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.bookings || [];

      setBookings(data);
    } catch (error) {
      console.error("Bookings fetch error:", error);

      setBookings([]);

      console.error(
        error.response?.data?.message ||
          "Unable to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ========================================
  // SEARCH + FILTER
  // ========================================

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const movieName =
        booking.show?.movie?.title || "";

      const customerName =
        booking.user?.name || "";

      const customerEmail =
        booking.user?.email || "";

      const theatreName =
        booking.show?.theatre?.name || "";

      const ticketId =
        booking.ticketId || "";

      const bookingId =
        booking._id || "";

      const paymentId =
        booking.paymentId || "";

      const searchText = search
        .trim()
        .toLowerCase();

      const matchesSearch =
        movieName.toLowerCase().includes(searchText) ||
        customerName.toLowerCase().includes(searchText) ||
        customerEmail.toLowerCase().includes(searchText) ||
        theatreName.toLowerCase().includes(searchText) ||
        ticketId.toLowerCase().includes(searchText) ||
        bookingId.toLowerCase().includes(searchText) ||
        paymentId.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        booking.bookingStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "All" ||
        booking.paymentStatus === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    bookings,
    search,
    statusFilter,
    paymentFilter,
  ]);

  // ========================================
  // STATS
  // ========================================

  const stats = useMemo(() => {
    const total = bookings.length;

    const confirmed = bookings.filter(
      (booking) =>
        booking.bookingStatus === "Confirmed"
    ).length;

    const pending = bookings.filter(
      (booking) =>
        booking.bookingStatus === "Pending"
    ).length;

    const cancelled = bookings.filter(
      (booking) =>
        booking.bookingStatus === "Cancelled"
    ).length;

    const revenue = bookings
      .filter(
        (booking) =>
          booking.paymentStatus === "Paid"
      )
      .reduce(
        (total, booking) =>
          total + Number(booking.totalAmount || 0),
        0
      );

    return {
      total,
      confirmed,
      pending,
      cancelled,
      revenue,
    };
  }, [bookings]);

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ========================================
  // STATUS CLASS
  // ========================================

  const getBookingStatusClass = (status) => {
    if (status === "Confirmed") {
      return "status-success";
    }

    if (status === "Cancelled") {
      return "status-danger";
    }

    return "status-warning";
  };

  const getPaymentStatusClass = (status) => {
    if (status === "Paid") {
      return "status-success";
    }

    if (
      status === "Failed" ||
      status === "Refunded"
    ) {
      return "status-danger";
    }

    return "status-warning";
  };

  // ========================================
  // SEAT NAME
  // ========================================

  const getSeatName = (seat) => {
    if (!seat) return "Seat";

    if (typeof seat === "string") {
      return seat;
    }

    return (
      seat.seatNumber ||
      seat.number ||
      seat.name ||
      "Seat"
    );
  };

  // ========================================
  // VIEW DETAILS
  // ========================================

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  return (
    <div className="bookings-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="bookings-header">

        <div>
          <span className="page-badge">
            TRANSACTIONS
          </span>

          <h1>Bookings Management</h1>

          <p>
            Manage CineBook customer bookings,
            seats and payments.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchBookings}
        >
          ↻ Refresh
        </button>

      </div>


      {/* ========================================
          STATS
      ======================================== */}

      <div className="booking-stats">

        <div className="booking-stat-card">
          <div className="stat-icon blue">
            🎟️
          </div>

          <div>
            <span>Total Bookings</span>
            <strong>{stats.total}</strong>
          </div>
        </div>


        <div className="booking-stat-card">
          <div className="stat-icon green">
            ✓
          </div>

          <div>
            <span>Confirmed</span>
            <strong>{stats.confirmed}</strong>
          </div>
        </div>


        <div className="booking-stat-card">
          <div className="stat-icon yellow">
            ◷
          </div>

          <div>
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>
        </div>


        <div className="booking-stat-card">
          <div className="stat-icon purple">
            ₹
          </div>

          <div>
            <span>Paid Revenue</span>
            <strong>
              ₹{stats.revenue.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

      </div>


      {/* ========================================
          BOOKINGS CARD
      ======================================== */}

      <div className="bookings-card">

        {/* TOOLBAR */}

        <div className="booking-toolbar">

          <div className="booking-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search customer, movie, theatre, ticket..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Booking Status
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Confirmed">
              Confirmed
            </option>

            <option value="Cancelled">
              Cancelled
            </option>
          </select>


          <select
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(e.target.value)
            }
          >
            <option value="All">
              All Payments
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Paid">
              Paid
            </option>

            <option value="Failed">
              Failed
            </option>

            <option value="Refunded">
              Refunded
            </option>
          </select>

        </div>


        {/* ========================================
            TABLE
        ======================================== */}

        <div className="table-wrapper">

          {loading ? (

            <div className="booking-loading">

              <div className="loader"></div>

              <p>
                Loading bookings...
              </p>

            </div>

          ) : filteredBookings.length === 0 ? (

            <div className="empty-bookings">

              <div>🎟️</div>

              <h3>
                No Bookings Found
              </h3>

              <p>
                Customer bookings will appear here.
              </p>

            </div>

          ) : (

            <table>

              <thead>

                <tr>
                  <th>BOOKING</th>
                  <th>CUSTOMER</th>
                  <th>MOVIE</th>
                  <th>THEATRE</th>
                  <th>SHOW</th>
                  <th>SEATS</th>
                  <th>AMOUNT</th>
                  <th>PAYMENT</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>

              </thead>


              <tbody>

                {filteredBookings.map(
                  (booking) => {

                    const movie =
                      booking.show?.movie;

                    const theatre =
                      booking.show?.theatre;

                    const screen =
                      booking.show?.screen;

                    const user =
                      booking.user;

                    return (

                      <tr
                        key={booking._id}
                      >

                        {/* BOOKING */}

                        <td>

                          <div className="booking-id">
                            #
                            {booking._id
                              ?.slice(-8)
                              .toUpperCase()}
                          </div>

                          <small>
                            {formatDate(
                              booking.bookingDate
                            )}
                          </small>

                          {booking.ticketId && (
                            <small className="ticket-id">
                              Ticket:{" "}
                              {booking.ticketId}
                            </small>
                          )}

                        </td>


                        {/* CUSTOMER */}

                        <td>

                          <div className="customer-cell">

                            <div className="customer-avatar">
                              {(
                                user?.name ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {user?.name ||
                                  "Unknown User"}
                              </strong>

                              <small>
                                {user?.email ||
                                  "-"}
                              </small>
                            </div>

                          </div>

                        </td>


                        {/* MOVIE */}

                        <td>

                          <div className="movie-cell">

                            {movie?.poster ? (

                              <img
                                src={movie.poster}
                                alt={
                                  movie.title
                                }
                                className="booking-movie-poster"
                              />

                            ) : (

                              <div className="movie-placeholder">
                                🎬
                              </div>

                            )}

                            <strong>
                              {movie?.title ||
                                "Unknown Movie"}
                            </strong>

                          </div>

                        </td>


                        {/* THEATRE */}

                        <td>

                          <div className="theatre-cell">

                            <strong>
                              {theatre?.name ||
                                "Unknown Theatre"}
                            </strong>

                            <small>
                              {theatre?.city ||
                                "-"}
                            </small>

                          </div>

                        </td>


                        {/* SHOW */}

                        <td>

                          <div className="show-cell">

                            <strong>
                              {formatDate(
                                booking.show
                                  ?.showDate
                              )}
                            </strong>

                            <span>
                              {booking.show
                                ?.startTime ||
                                "-"}
                            </span>

                            <small>
                              {screen?.name ||
                                "Screen"}{" "}
                              •{" "}
                              {screen?.screenType ||
                                "-"}
                            </small>

                          </div>

                        </td>


                        {/* SEATS */}

                        <td>

                          <div className="seat-tags">

                            {Array.isArray(
                              booking.seats
                            ) &&
                            booking.seats.length > 0 ? (

                              booking.seats
                                .slice(0, 4)
                                .map(
                                  (
                                    seat,
                                    index
                                  ) => (

                                    <span
                                      key={
                                        seat?._id ||
                                        index
                                      }
                                    >
                                      {getSeatName(
                                        seat
                                      )}
                                    </span>

                                  )
                                )

                            ) : (
                              <span>-</span>
                            )}

                            {booking.seats?.length >
                              4 && (

                              <span className="more-seats">
                                +
                                {booking.seats.length -
                                  4}
                              </span>

                            )}

                          </div>

                        </td>


                        {/* AMOUNT */}

                        <td>

                          <strong className="amount">

                            ₹
                            {Number(
                              booking.totalAmount || 0
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </strong>

                        </td>


                        {/* PAYMENT */}

                        <td>

                          <span
                            className={`status-pill ${getPaymentStatusClass(
                              booking.paymentStatus
                            )}`}
                          >
                            {booking.paymentStatus}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`status-pill ${getBookingStatusClass(
                              booking.bookingStatus
                            )}`}
                          >
                            {booking.bookingStatus}
                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          <button
                            className="view-booking"
                            onClick={() =>
                              handleViewBooking(
                                booking
                              )
                            }
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          )}

        </div>


        {/* FOOTER */}

        {!loading &&
          filteredBookings.length > 0 && (

            <div className="table-footer">

              Showing{" "}
              <strong>
                {filteredBookings.length}
              </strong>{" "}
              of{" "}
              <strong>
                {bookings.length}
              </strong>{" "}
              bookings

            </div>

          )}

      </div>


      {/* ========================================
          BOOKING DETAILS MODAL
      ======================================== */}

      {selectedBooking && (

        <div
          className="booking-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="booking-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span className="page-badge">
                  BOOKING DETAILS
                </span>

                <h2>
                  #
                  {selectedBooking._id
                    ?.slice(-8)
                    .toUpperCase()}
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>


            {/* MOVIE */}

            <div className="modal-movie">

              {selectedBooking.show?.movie
                ?.poster ? (

                <img
                  src={
                    selectedBooking.show
                      .movie.poster
                  }
                  alt={
                    selectedBooking.show
                      .movie.title
                  }
                />

              ) : (

                <div className="modal-movie-placeholder">
                  🎬
                </div>

              )}

              <div>

                <h3>
                  {selectedBooking.show
                    ?.movie?.title ||
                    "Unknown Movie"}
                </h3>

                <p>
                  {selectedBooking.show
                    ?.movie?.language ||
                    "-"}
                  {" • "}
                  {selectedBooking.show
                    ?.movie?.duration ||
                    "-"}
                </p>

              </div>

            </div>


            {/* DETAILS */}

            <div className="detail-grid">

              <div>
                <span>Customer</span>
                <strong>
                  {selectedBooking.user?.name ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {selectedBooking.user?.email ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>Theatre</span>
                <strong>
                  {selectedBooking.show?.theatre
                    ?.name || "-"}
                </strong>
              </div>

              <div>
                <span>City</span>
                <strong>
                  {selectedBooking.show?.theatre
                    ?.city || "-"}
                </strong>
              </div>

              <div>
                <span>Screen</span>
                <strong>
                  {selectedBooking.show?.screen
                    ?.name || "-"}
                </strong>
              </div>

              <div>
                <span>Screen Type</span>
                <strong>
                  {selectedBooking.show?.screen
                    ?.screenType || "-"}
                </strong>
              </div>

              <div>
                <span>Show Date</span>
                <strong>
                  {formatDate(
                    selectedBooking.show?.showDate
                  )}
                </strong>
              </div>

              <div>
                <span>Show Time</span>
                <strong>
                  {selectedBooking.show?.startTime ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>Booking Date</span>
                <strong>
                  {formatDate(
                    selectedBooking.bookingDate
                  )}
                </strong>
              </div>

              <div>
                <span>Total Amount</span>
                <strong>
                  ₹
                  {Number(
                    selectedBooking.totalAmount || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Payment Status</span>
                <strong>
                  {selectedBooking.paymentStatus}
                </strong>
              </div>

              <div>
                <span>Booking Status</span>
                <strong>
                  {selectedBooking.bookingStatus}
                </strong>
              </div>

            </div>


            {/* SEATS */}

            <div className="modal-section">

              <h4>
                Selected Seats
              </h4>

              <div className="modal-seat-list">

                {selectedBooking.seats?.map(
                  (seat, index) => (

                    <span
                      key={
                        seat?._id || index
                      }
                    >
                      {getSeatName(seat)}
                    </span>

                  )
                )}

              </div>

            </div>


            {/* PAYMENT */}

            <div className="modal-section">

              <h4>
                Payment Information
              </h4>

              <div className="payment-box">

                <div>
                  <span>Payment ID</span>

                  <strong>
                    {selectedBooking.paymentId ||
                      "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Ticket ID</span>

                  <strong>
                    {selectedBooking.ticketId ||
                      "Not generated"}
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default AdminBookings;

