import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Payments.css";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const res = await api.get("/payments/admin");

      setPayments(res.data.payments || []);
    } catch (error) {
      console.error(
        "Payment fetch error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const user = payment.user;
      const movie = payment.show?.movie;

      const searchText = `
        ${user?.name || ""}
        ${user?.email || ""}
        ${movie?.title || ""}
        ${payment.paymentId || ""}
        ${payment._id || ""}
      `.toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase()
      );

      const matchesStatus =
        statusFilter === "All" ||
        payment.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  const stats = useMemo(() => {
    const total = payments.length;

    const paid = payments.filter(
      (item) => item.paymentStatus === "Paid"
    );

    const pending = payments.filter(
      (item) => item.paymentStatus === "Pending"
    );

    const failed = payments.filter(
      (item) => item.paymentStatus === "Failed"
    );

    const refunded = payments.filter(
      (item) => item.paymentStatus === "Refunded"
    );

    const revenue = paid.reduce(
      (sum, item) => sum + Number(item.totalAmount || 0),
      0
    );

    return {
      total,
      paid: paid.length,
      pending: pending.length,
      failed: failed.length,
      refunded: refunded.length,
      revenue,
    };
  }, [payments]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Paid":
        return "payment-status paid";

      case "Pending":
        return "payment-status pending";

      case "Failed":
        return "payment-status failed";

      case "Refunded":
        return "payment-status refunded";

      default:
        return "payment-status";
    }
  };

  return (
    <div className="payments-page">

      {/* HEADER */}
      <div className="payments-header">
        <div>
          <span className="page-eyebrow">
            TRANSACTION MANAGEMENT
          </span>

          <h1>
            Payments <span>Overview</span>
          </h1>

          <p>
            Monitor CineBook payment transactions,
            revenue and payment status.
          </p>
        </div>

        <button
          className="refresh-payment-btn"
          onClick={fetchPayments}
        >
          ↻ Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="payment-stats">

        <div className="payment-stat-card">
          <div className="payment-stat-icon blue">
            ₹
          </div>

          <div>
            <span>Total Revenue</span>
            <strong>
              ₹{stats.revenue.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon green">
            ✓
          </div>

          <div>
            <span>Paid</span>
            <strong>{stats.paid}</strong>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon orange">
            ◷
          </div>

          <div>
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon red">
            !
          </div>

          <div>
            <span>Failed</span>
            <strong>{stats.failed}</strong>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon purple">
            ↩
          </div>

          <div>
            <span>Refunded</span>
            <strong>{stats.refunded}</strong>
          </div>
        </div>

      </div>

      {/* TOOLBAR */}
      <div className="payments-toolbar">

        <div className="payment-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search payment, customer or movie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="payment-filter"
        >
          <option value="All">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>

      </div>

      {/* TABLE */}
      <div className="payments-table-wrapper">

        {loading ? (
          <div className="payments-loading">
            <div className="payment-spinner"></div>
            <p>Loading payments...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="payments-empty">
            <div>💳</div>
            <h3>No payments found</h3>
            <p>
              Payment transactions will appear here.
            </p>
          </div>
        ) : (
          <table className="payments-table">

            <thead>
              <tr>
                <th>PAYMENT</th>
                <th>CUSTOMER</th>
                <th>MOVIE</th>
                <th>BOOKING</th>
                <th>AMOUNT</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>

              {filteredPayments.map((payment) => {

                const movie =
                  payment.show?.movie;

                return (
                  <tr key={payment._id}>

                    <td>
                      <div className="payment-id-cell">
                        <strong>
                          {payment.paymentId
                            ? payment.paymentId.slice(0, 18)
                            : "N/A"}
                        </strong>

                        <span>
                          Razorpay
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="customer-payment">

                        <div className="payment-avatar">
                          {payment.user?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div>
                          <strong>
                            {payment.user?.name ||
                              "Unknown User"}
                          </strong>

                          <span>
                            {payment.user?.email ||
                              "No email"}
                          </span>
                        </div>

                      </div>
                    </td>

                    <td>
                      <div className="payment-movie">

                        {movie?.poster ? (
                          <img
                            src={movie.poster}
                            alt={movie.title}
                          />
                        ) : (
                          <div className="payment-movie-placeholder">
                            🎬
                          </div>
                        )}

                        <span>
                          {movie?.title ||
                            "Unknown Movie"}
                        </span>

                      </div>
                    </td>

                    <td>
                      <span className="booking-reference">
                        #
                        {payment._id
                          ?.slice(-8)
                          .toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <strong className="payment-amount">
                        ₹
                        {Number(
                          payment.totalAmount || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      <span className="payment-date">
                        {formatDate(
                          payment.bookingDate ||
                            payment.createdAt
                        )}
                      </span>
                    </td>

                    <td>
                      <span
                        className={getStatusClass(
                          payment.paymentStatus
                        )}
                      >
                        {payment.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <button
                        className="payment-view-btn"
                        onClick={() =>
                          setSelectedPayment(payment)
                        }
                      >
                        View
                      </button>
                    </td>

                  </tr>
                );
              })}

            </tbody>
          </table>
        )}

      </div>

      {/* MODAL */}
      {selectedPayment && (
        <div
          className="payment-modal-overlay"
          onClick={() =>
            setSelectedPayment(null)
          }
        >

          <div
            className="payment-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="payment-modal-header">

              <div>
                <span>
                  PAYMENT DETAILS
                </span>

                <h2>
                  Transaction
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedPayment(null)
                }
              >
                ×
              </button>

            </div>

            <div className="payment-modal-body">

              <div className="payment-modal-status">

                <div className="large-payment-icon">
                  ₹
                </div>

                <div>
                  <span>Amount Paid</span>

                  <strong>
                    ₹
                    {Number(
                      selectedPayment.totalAmount ||
                        0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <span
                  className={getStatusClass(
                    selectedPayment.paymentStatus
                  )}
                >
                  {selectedPayment.paymentStatus}
                </span>

              </div>

              <div className="payment-details-grid">

                <div>
                  <span>Payment ID</span>
                  <strong>
                    {selectedPayment.paymentId ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Booking ID</span>
                  <strong>
                    {selectedPayment._id}
                  </strong>
                </div>

                <div>
                  <span>Customer</span>
                  <strong>
                    {selectedPayment.user?.name ||
                      "Unknown"}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {selectedPayment.user?.email ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Movie</span>
                  <strong>
                    {selectedPayment.show?.movie
                      ?.title || "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Theatre</span>
                  <strong>
                    {selectedPayment.show?.theatre
                      ?.name || "N/A"}
                  </strong>
                </div>

                <div>
                  <span>City</span>
                  <strong>
                    {selectedPayment.show?.theatre
                      ?.city || "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Screen</span>
                  <strong>
                    {selectedPayment.show?.screen
                      ?.name || "N/A"}
                  </strong>
                </div>

              </div>

              <div className="payment-modal-footer">

                <span>
                  Transaction Date
                </span>

                <strong>
                  {formatDate(
                    selectedPayment.createdAt
                  )}
                </strong>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default AdminPayments;