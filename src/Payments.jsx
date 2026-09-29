import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "./services/api";
import "./Payments.css"

// Flat display-only convenience fee. NOTE: this is shown in the UI
// breakdown for realism, but the actual Razorpay order amount created
// by the backend (createOrder) still charges exactly booking.totalAmount.
// If you want this fee actually collected, add it to the `amount` in
// paymentController.createOrder as well so the two stay in sync.
const CONVENIENCE_FEE = 15;

const PAYMENT_METHODS = [
  { key: "card", label: "Credit / Debit Card", icon: "💳", razorpayMethod: "card" },
  { key: "upi", label: "UPI", icon: "📱", razorpayMethod: "upi" },
  { key: "netbanking", label: "Netbanking", icon: "🏦", razorpayMethod: "netbanking" },
  { key: "wallet", label: "Wallet", icon: "👛", razorpayMethod: "wallet" }
];

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paying, setPaying] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (error) {
        console.log("Booking load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const handlePayment = async (methodKey) => {
    setSelectedMethod(methodKey);
    setPaying(true);

    try {
      const response = await axios.post(
        "http://localhost:6060/api/payments/create-order",
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const order = response.data.order;
      const methodConfig = PAYMENT_METHODS.find((m) => m.key === methodKey);

      const options = {
        key: "rzp_test_TXZle0WOk1ZQHT",
        amount: order.amount,
        currency: order.currency,
        name: "CineBook",
        description: booking?.show?.movie?.title || "Movie Ticket Booking",
        order_id: order.id,

        // Preselects the matching tab in Razorpay's checkout instead
        // of showing the full method picker again -- keeps the flow
        // feeling like a direct continuation of the button they clicked.
        method: methodConfig
          ? { [methodConfig.razorpayMethod]: true }
          : undefined,

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await axios.post(
              "http://localhost:6060/api/payments/verify",
              {
                bookingId,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`
                }
              }
            );

            alert(verifyResponse.data.message);
            navigate(`/ticket/${bookingId}`);
          } catch (error) {
            alert(
              error.response?.data?.message || "Payment verification failed"
            );
          }
        },

        modal: {
          ondismiss: () => setPaying(false)
        },

        prefill: {
          name: booking?.user?.name || "CineBook User",
          email: booking?.user?.email || "user@example.com"
        },

        theme: {
          color: "#e50914"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Unable to create payment order");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="pay-page-loading">
        <div className="loader"></div>
        <p>Loading your order...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="pay-page-loading">
        <p>Booking not found.</p>
      </div>
    );
  }

  const movie = booking.show?.movie;
  const theatre = booking.show?.theatre;
  const ticketCount = booking.seats?.length || 0;
  const subtotal = booking.totalAmount || 0;
  const total = subtotal + CONVENIENCE_FEE;

  return (
    <div className="pay-page">
      <div className="pay-card">

        {/* Movie header strip */}
        <div className="pay-header">
          <div className="pay-header-poster">
            {movie?.poster ? (
              <img src={movie.poster} alt={movie.title} />
            ) : (
              <div className="pay-poster-fallback">🎬</div>
            )}
          </div>

          <div className="pay-header-info">
            <h2>{movie?.title || "Movie"}</h2>
            <div className="pay-header-meta">
              {movie?.rating && <span className="pay-rating-chip">{movie.rating}</span>}
              <span>{booking.show?.format || "2D"}</span>
              <span>{theatre?.name || "Theatre"}</span>
            </div>
          </div>

          <button
            className="pay-header-toggle"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label="Toggle order summary"
          >
            <span className={expanded ? "rotated" : ""}>⌄</span>
          </button>
        </div>

        {/* Body */}
        <div className="pay-body">
          <h1>Payment</h1>

          {/* Ticket line item */}
          <div className={`pay-line-item ${expanded ? "" : "collapsed"}`}>
            <div className="pay-line-item-top">
              <div>
                <strong>Tickets</strong>
                <small>ADDED ({ticketCount}) TICKET{ticketCount !== 1 ? "S" : ""}</small>
              </div>
              <div className="pay-line-item-price">
                ₹{subtotal.toFixed(2)}
              </div>
            </div>

            {expanded && (
              <div className="pay-seat-list">
                {booking.seats?.map((seat) => (
                  <span key={seat._id} className="pay-seat-chip">
                    {seat.row}{seat.seatNumber} · ₹{seat.price}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Fee */}
          <div className="pay-row">
            <div>
              <span>Booking Fee</span>
              <small>(Non-Refundable)</small>
            </div>
            <span>₹{CONVENIENCE_FEE.toFixed(2)}</span>
          </div>

          <div className="pay-divider" />

          {/* Total */}
          <div className="pay-row pay-total-row">
            <strong>Total</strong>
            <strong>₹{total.toFixed(2)}</strong>
          </div>

          {/* Payment method buttons */}
          <div className="pay-methods">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.key}
                className={`pay-method-btn ${
                  selectedMethod === method.key && paying ? "loading" : ""
                }`}
                disabled={paying}
                onClick={() => handlePayment(method.key)}
              >
                <span className="pay-method-icon">{method.icon}</span>
                {selectedMethod === method.key && paying
                  ? "Opening checkout..."
                  : method.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
