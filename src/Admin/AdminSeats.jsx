import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./Seats.css";

const AdminSeats = () => {
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [selectedTheatre, setSelectedTheatre] = useState("");
  const [selectedScreen, setSelectedScreen] = useState("");
  const [loading, setLoading] = useState(false);

  const [seatRows, setSeatRows] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    booked: 0,
    selected: 0,
  });

  // NEW: editable price tiers -- last row becomes VIP, the two rows
  // before that become Premium, everything else stays Regular.
  const [prices, setPrices] = useState({
    regular: 150,
    premium: 250,
    vip: 400,
  });

  const fetchTheatres = async () => {
    try {
      const res = await api.get("/theatres");
      setTheatres(Array.isArray(res.data) ? res.data : res.data.theatres || []);
    } catch (error) {
      console.error("Theatre fetch error:", error);
    }
  };

  const fetchScreens = async () => {
    try {
      const res = await api.get("/screens");
      setScreens(Array.isArray(res.data) ? res.data : res.data.screens || []);
    } catch (error) {
      console.error("Screen fetch error:", error);
    }
  };

  useEffect(() => {
    fetchTheatres();
    fetchScreens();
  }, []);

  const filteredScreens = screens.filter((screen) => {
    const theatreId = screen.theatre?._id || screen.theatre;
    return theatreId === selectedTheatre;
  });

  const handleTheatreChange = (e) => {
    const value = e.target.value;
    setSelectedTheatre(value);
    setSelectedScreen("");
    setSeatRows([]);
    resetStats();
  };

  const handleScreenChange = (e) => {
    const value = e.target.value;
    setSelectedScreen(value);

    const screen = screens.find((item) => item._id === value);
    if (screen) {
      generateSeatLayout(Number(screen.rows), Number(screen.seatsPerRow));
    }
  };

  // CHANGED: each seat now also carries a `type` (Regular/Premium/VIP)
  // based on its row -- last row is VIP, the two rows before that are
  // Premium, everything else is Regular. This is what actually gets
  // saved (along with price) when the layout is saved.
  const generateSeatLayout = (rows, seatsPerRow) => {
    if (!rows || !seatsPerRow) {
      setSeatRows([]);
      resetStats();
      return;
    }

    const generatedRows = [];

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      const rowLetter = String.fromCharCode(65 + rowIndex);
      const rowsFromEnd = rows - rowIndex;

      let type = "Regular";
      if (rowsFromEnd === 1) type = "VIP";
      else if (rowsFromEnd <= 3) type = "Premium";

      const seats = [];
      for (let seatIndex = 1; seatIndex <= seatsPerRow; seatIndex++) {
        seats.push({
          id: `${rowLetter}${seatIndex}`,
          number: seatIndex,
          status: "available",
          type,
        });
      }

      generatedRows.push({ row: rowLetter, seats });
    }

    setSeatRows(generatedRows);
    setStats({
      total: rows * seatsPerRow,
      available: rows * seatsPerRow,
      booked: 0,
      selected: 0,
    });
  };

  const toggleSeat = (rowIndex, seatIndex) => {
    setSeatRows((prevRows) => {
      const updatedRows = [...prevRows];
      const seat = updatedRows[rowIndex].seats[seatIndex];

      if (seat.status === "booked") return prevRows;

      seat.status = seat.status === "selected" ? "available" : "selected";
      return updatedRows;
    });

    calculateStats();
  };

  const calculateStats = () => {
    setTimeout(() => {
      setSeatRows((currentRows) => {
        let available = 0;
        let booked = 0;
        let selected = 0;

        currentRows.forEach((row) => {
          row.seats.forEach((seat) => {
            if (seat.status === "available") available++;
            if (seat.status === "booked") booked++;
            if (seat.status === "selected") selected++;
          });
        });

        setStats({ total: available + booked + selected, available, booked, selected });
        return currentRows;
      });
    }, 0);
  };

  const resetStats = () => {
    setStats({ total: 0, available: 0, booked: 0, selected: 0 });
  };

  const priceForType = (type) => {
    if (type === "VIP") return Number(prices.vip);
    if (type === "Premium") return Number(prices.premium);
    return Number(prices.regular);
  };

  // CHANGED: this used to only console.log the layout and show a fake
  // success alert -- no seat was ever actually saved to the database,
  // which is why the customer-facing seat page always showed "No
  // seats available". It now POSTs the generated layout to the
  // backend (which replaces any existing seats for this screen).
  const handleSaveSeats = async () => {
    if (!selectedScreen) {
      alert("Please select a screen.");
      return;
    }

    if (!seatRows.length) {
      alert("No seats generated.");
      return;
    }

    try {
      setLoading(true);

      const seatsPayload = seatRows.flatMap((row) =>
        row.seats.map((seat) => ({
          row: row.row,
          seatNumber: seat.number,
          seatType: seat.type,
          price: priceForType(seat.type),
        }))
      );

      const res = await api.post("/seats/bulk", {
        screen: selectedScreen,
        seats: seatsPayload,
      });

      alert(res.data.message || "Seat layout saved successfully!");
    } catch (error) {
      console.error("Seat save error:", error);
      alert(error.response?.data?.message || "Unable to save seats.");
    } finally {
      setLoading(false);
    }
  };

  const theatreName =
    theatres.find((item) => item._id === selectedTheatre)?.name || "";

  const selectedScreenData = screens.find(
    (item) => item._id === selectedScreen
  );

  return (
    <div className="seats-management">
      <div className="seats-header">
        <div>
          <span className="seats-label">CINEBOOK ADMIN</span>
          <h1>
            Seat <span>Management</span>
          </h1>
          <p>Configure cinema seating layouts and monitor seat availability.</p>
        </div>

        <div className="seat-system-card">
          <div className="seat-system-icon">💺</div>
          <div>
            <strong>Seat Control</strong>
            <span>Cinema Layout System</span>
          </div>
        </div>
      </div>

      <div className="seat-config-card">
        <div className="seat-config-heading">
          <div>
            <span>SEATING CONFIGURATION</span>
            <h2>Select Cinema Screen</h2>
            <p>Choose a theatre and screen to generate its seating layout.</p>
          </div>
          <div className="config-status">
            <span></span>
            SYSTEM READY
          </div>
        </div>

        <div className="seat-form-grid">
          <div className="seat-form-group">
            <label>Select Theatre</label>
            <div className="seat-input">
              <span>🏢</span>
              <select value={selectedTheatre} onChange={handleTheatreChange}>
                <option value="">Choose Theatre</option>
                {theatres.map((theatre) => (
                  <option key={theatre._id} value={theatre._id}>
                    {theatre.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="seat-form-group">
            <label>Select Screen</label>
            <div className="seat-input">
              <span>🖥️</span>
              {/* CHANGED: screen.screenName -> screen.name, matching
                  the backend Screen model's actual field name */}
              <select
                value={selectedScreen}
                onChange={handleScreenChange}
                disabled={!selectedTheatre}
              >
                <option value="">
                  {selectedTheatre ? "Choose Screen" : "Select Theatre First"}
                </option>
                {filteredScreens.map((screen) => (
                  <option key={screen._id} value={screen._id}>
                    {screen.name} — {screen.screenType}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="seat-form-grid" style={{ marginTop: "16px" }}>
          <div className="seat-form-group">
            <label>Regular Price (₹)</label>
            <div className="seat-input">
              <span>₹</span>
              <input
                type="number"
                min="0"
                value={prices.regular}
                onChange={(e) => setPrices((p) => ({ ...p, regular: e.target.value }))}
              />
            </div>
          </div>

          <div className="seat-form-group">
            <label>Premium Price (₹)</label>
            <div className="seat-input">
              <span>₹</span>
              <input
                type="number"
                min="0"
                value={prices.premium}
                onChange={(e) => setPrices((p) => ({ ...p, premium: e.target.value }))}
              />
            </div>
          </div>

          <div className="seat-form-group">
            <label>VIP Price (₹)</label>
            <div className="seat-input">
              <span>₹</span>
              <input
                type="number"
                min="0"
                value={prices.vip}
                onChange={(e) => setPrices((p) => ({ ...p, vip: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {selectedScreenData && (
          <div className="selected-screen-info">
            <div className="screen-info-icon">🎬</div>
            <div>
              <span>SELECTED SCREEN</span>
              <strong>{selectedScreenData.name}</strong>
              <small>
                {theatreName} • {selectedScreenData.screenType}
              </small>
            </div>
            <div className="screen-capacity">
              <span>CAPACITY</span>
              <strong>{selectedScreenData.totalSeats}</strong>
              <small>Seats</small>
            </div>
          </div>
        )}
      </div>

      {seatRows.length > 0 && (
        <div className="seat-stats">
          <div className="seat-stat total">
            <span>🎟️</span>
            <div>
              <small>TOTAL SEATS</small>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="seat-stat available">
            <span>✓</span>
            <div>
              <small>AVAILABLE</small>
              <strong>{stats.available}</strong>
            </div>
          </div>

          <div className="seat-stat selected">
            <span>●</span>
            <div>
              <small>SELECTED</small>
              <strong>{stats.selected}</strong>
            </div>
          </div>

          <div className="seat-stat booked">
            <span>×</span>
            <div>
              <small>BOOKED</small>
              <strong>{stats.booked}</strong>
            </div>
          </div>
        </div>
      )}

      {seatRows.length > 0 ? (
        <div className="seat-map-card">
          <div className="seat-map-heading">
            <div>
              <span>LIVE SEAT MAP</span>
              <h2>{selectedScreenData?.name}</h2>
            </div>

            <div className="seat-legend">
              <div>
                <span className="legend available"></span>
                Available
              </div>
              <div>
                <span className="legend selected"></span>
                Selected
              </div>
              <div>
                <span className="legend booked"></span>
                Booked
              </div>
            </div>
          </div>

          <div className="cinema-screen">
            <div className="screen-glow"></div>
            <span>SCREEN</span>
          </div>

          <div className="seat-layout">
            {seatRows.map((row, rowIndex) => (
              <div className="seat-row" key={row.row}>
                <div className="row-label">{row.row}</div>

                <div className="seat-list">
                  {row.seats.map((seat, seatIndex) => (
                    <button
                      key={seat.id}
                      className={`seat ${seat.status}`}
                      onClick={() => toggleSeat(rowIndex, seatIndex)}
                      title={`${row.row}${seat.number} • ${seat.type}`}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>

                <div className="row-label">{row.row}</div>
              </div>
            ))}
          </div>

          <div className="seat-map-actions">
            <div>
              <strong>{stats.selected}</strong>
              <span>seats selected</span>
            </div>

            <button
              className="save-seat-btn"
              onClick={handleSaveSeats}
              disabled={loading}
            >
              {loading ? "Saving..." : "✓ Save Seat Layout"}
            </button>
          </div>
        </div>
      ) : (
        <div className="seat-empty">
          <div className="empty-seat-icon">💺</div>
          <h3>Select a Screen</h3>
          <p>Choose a theatre and screen above to view the seating layout.</p>
        </div>
      )}
    </div>
  );
};

export default AdminSeats;
