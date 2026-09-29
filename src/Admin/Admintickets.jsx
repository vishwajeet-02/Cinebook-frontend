import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminTickets.css";

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/admin/tickets");
        setTickets(res.data);
      } catch (error) {
        console.log("Admin Tickets Error:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.ticketId?.toLowerCase().includes(q) ||
      t.user?.name?.toLowerCase().includes(q) ||
      t.show?.movie?.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span>TRANSACTIONS</span>
          <h1>Tickets</h1>
          <p>Every confirmed, paid booking issued as a ticket.</p>
        </div>

        <div className="admin-page-actions">
          <input
            className="admin-search-input"
            placeholder="Search ticket, user, movie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Loading tickets...</div>
        ) : filtered.length === 0 ? (
          <div className="admin-table-empty">No tickets found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>QR</th>
                <th>Ticket ID</th>
                <th>User</th>
                <th>Movie</th>
                <th>Theatre</th>
                <th>Seats</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => (
                <tr key={ticket._id}>
                  <td>
                    {ticket.qrCode ? (
                      <div className="admin-qr-thumb">
                        <img src={ticket.qrCode} alt="QR" />
                      </div>
                    ) : (
                      <span className="admin-cell-muted">—</span>
                    )}
                  </td>
                  <td className="admin-cell-primary">
                    {ticket.ticketId || "—"}
                  </td>
                  <td>
                    <div>{ticket.user?.name}</div>
                    <div className="admin-cell-muted">
                      {ticket.user?.email}
                    </div>
                  </td>
                  <td>{ticket.show?.movie?.title || "—"}</td>
                  <td>{ticket.show?.theatre?.name || "—"}</td>
                  <td>
                    {ticket.seats
                      ?.map((s) => `${s.row}${s.seatNumber}`)
                      .join(", ") || "—"}
                  </td>
                  <td className="admin-cell-primary">
                    ₹{ticket.totalAmount}
                  </td>
                  <td>
                    <span className="admin-badge success">
                      ● Confirmed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminTickets;
