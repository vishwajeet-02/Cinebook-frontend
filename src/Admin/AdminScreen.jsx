import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./Screen.css";

const AdminScreen = () => {
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);

  // CHANGED: "screenName" -> "name" everywhere in this file.
  // The backend Screen model's field is called `name`, not
  // `screenName` -- that mismatch is exactly why saving failed
  // with "Screen validation failed: name: Path `name` is required."
  const [formData, setFormData] = useState({
    theatre: "",
    name: "",
    screenType: "2D",
    rows: "",
    seatsPerRow: "",
    totalSeats: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==============================
  // FETCH THEATRES
  // ==============================
  const fetchTheatres = async () => {
    try {
      const res = await api.get("/theatres");

      setTheatres(
        Array.isArray(res.data)
          ? res.data
          : res.data.theatres || []
      );
    } catch (error) {
      console.error("Theatre fetch error:", error);
    }
  };

  // ==============================
  // FETCH SCREENS
  // ==============================
  const fetchScreens = async () => {
    try {
      const res = await api.get("/screens");

      setScreens(
        Array.isArray(res.data)
          ? res.data
          : res.data.screens || []
      );
    } catch (error) {
      console.error("Screen fetch error:", error);
    }
  };

  // ==============================
  // INITIAL LOAD
  // ==============================
  useEffect(() => {
    fetchTheatres();
    fetchScreens();
  }, []);

  // ==============================
  // HANDLE INPUT
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "rows" || name === "seatsPerRow") {
        const rows =
          name === "rows"
            ? Number(value)
            : Number(prev.rows);

        const seatsPerRow =
          name === "seatsPerRow"
            ? Number(value)
            : Number(prev.seatsPerRow);

        updated.totalSeats =
          rows > 0 && seatsPerRow > 0
            ? rows * seatsPerRow
            : "";
      }

      return updated;
    });
  };

  // ==============================
  // SUBMIT
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.theatre ||
      !formData.name.trim() ||
      !formData.rows ||
      !formData.seatsPerRow
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const screenData = {
        theatre: formData.theatre,
        name: formData.name.trim(),
        screenType: formData.screenType,
        rows: Number(formData.rows),
        seatsPerRow: Number(formData.seatsPerRow),
        totalSeats: Number(formData.totalSeats),
      };

      if (editingId) {
        await api.put(
          `/screens/${editingId}`,
          screenData
        );

        alert("Screen updated successfully!");
      } else {
        await api.post("/screens", screenData);

        alert("Screen added successfully!");
      }

      resetForm();
      await fetchScreens();
    } catch (error) {
      console.error("Screen save error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to save screen."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // EDIT
  // ==============================
  const handleEdit = (screen) => {
    setEditingId(screen._id);

    setFormData({
      theatre:
        screen.theatre?._id ||
        screen.theatre ||
        "",

      name:
        screen.name || "",

      screenType:
        screen.screenType || "2D",

      rows:
        screen.rows || "",

      seatsPerRow:
        screen.seatsPerRow || "",

      totalSeats:
        screen.totalSeats || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==============================
  // DELETE
  // ==============================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this screen?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/screens/${id}`);

      alert("Screen deleted successfully!");

      await fetchScreens();
    } catch (error) {
      console.error("Delete error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete screen."
      );
    }
  };

  // ==============================
  // RESET
  // ==============================
  const resetForm = () => {
    setEditingId(null);

    setFormData({
      theatre: "",
      name: "",
      screenType: "2D",
      rows: "",
      seatsPerRow: "",
      totalSeats: "",
    });
  };

  // ==============================
  // GET THEATRE NAME
  // ==============================
  const getTheatreName = (screen) => {
    if (screen.theatre?.name) {
      return screen.theatre.name;
    }

    const theatre = theatres.find(
      (item) => item._id === screen.theatre
    );

    return theatre?.name || "Unknown Theatre";
  };

  return (
    <div className="screen-management">

      {/* =================================
          HERO HEADER
      ================================= */}
      <div className="screen-header">

        <div className="screen-header-content">

          <span className="screen-label">
            CINEBOOK ADMIN
          </span>

          <h1>
            Screen
            <span> Management</span>
          </h1>

          <p>
            Configure cinema screens, formats and
            seating capacity from one powerful
            dashboard.
          </p>

        </div>

        <div className="screen-count">

          <div className="count-icon">
            🎬
          </div>

          <div>
            <strong>
              {screens.length}
            </strong>

            <span>
              Total Screens
            </span>
          </div>

        </div>

      </div>


      {/* =================================
          FORM CARD
      ================================= */}
      <div className="screen-form-card">

        <div className="form-heading">

          <div>

            <span className="form-mini-label">
              {editingId
                ? "UPDATE CONFIGURATION"
                : "SCREEN CONFIGURATION"}
            </span>

            <h2>
              {editingId
                ? "Edit Screen"
                : "Add New Screen"}
            </h2>

            <p>
              Set theatre, screen format and seating
              capacity.
            </p>

          </div>

          {editingId && (
            <button
              type="button"
              className="cancel-edit-btn"
              onClick={resetForm}
            >
              ✕ Cancel Edit
            </button>
          )}

        </div>


        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            {/* THEATRE */}
            <div className="form-group">

              <label>
                Select Theatre
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ◉
                </span>

                <select
                  name="theatre"
                  value={formData.theatre}
                  onChange={handleChange}
                >

                  <option value="">
                    Choose a theatre
                  </option>

                  {theatres.map((theatre) => (
                    <option
                      key={theatre._id}
                      value={theatre._id}
                    >
                      {theatre.name}
                    </option>
                  ))}

                </select>

              </div>

            </div>


            {/* SCREEN NAME */}
            <div className="form-group">

              <label>
                Screen Name
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ▣
                </span>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Screen 1"
                />

              </div>

            </div>


            {/* SCREEN TYPE */}
            <div className="form-group">

              <label>
                Screen Format
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ★
                </span>

                <select
                  name="screenType"
                  value={formData.screenType}
                  onChange={handleChange}
                >
                  <option value="2D">
                    2D
                  </option>

                  <option value="3D">
                    3D
                  </option>

                  <option value="IMAX">
                    IMAX
                  </option>

                  <option value="4DX">
                    4DX
                  </option>
                </select>

              </div>

            </div>


            {/* ROWS */}
            <div className="form-group">

              <label>
                Number of Rows
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ≡
                </span>

                <input
                  type="number"
                  name="rows"
                  min="1"
                  value={formData.rows}
                  onChange={handleChange}
                  placeholder="Example: 10"
                />

              </div>

            </div>


            {/* SEATS PER ROW */}
            <div className="form-group">

              <label>
                Seats Per Row
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ▦
                </span>

                <input
                  type="number"
                  name="seatsPerRow"
                  min="1"
                  value={formData.seatsPerRow}
                  onChange={handleChange}
                  placeholder="Example: 15"
                />

              </div>

            </div>


            {/* TOTAL SEATS */}
            <div className="form-group">

              <label>
                Total Seats
              </label>

              <div className="input-wrapper total-wrapper">

                <span className="input-icon">
                  ✓
                </span>

                <input
                  type="number"
                  value={formData.totalSeats}
                  readOnly
                  className="total-seat-input"
                  placeholder="Auto calculated"
                />

                {formData.totalSeats && (
                  <span className="auto-badge">
                    AUTO
                  </span>
                )}

              </div>

            </div>

          </div>


          {/* CAPACITY PREVIEW */}
          <div className="capacity-preview">

            <div className="capacity-icon">
              🪑
            </div>

            <div>

              <span>
                SEATING CAPACITY
              </span>

              <strong>
                {formData.totalSeats || 0}
                <small> seats</small>
              </strong>

            </div>

            <div className="capacity-formula">
              {formData.rows || 0}
              <span> × </span>
              {formData.seatsPerRow || 0}
              <small>
                rows × seats per row
              </small>
            </div>

          </div>


          {/* BUTTONS */}
          <div className="form-buttons">

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Saving...
                </>
              ) : editingId ? (
                <>
                  ✓ Update Screen
                </>
              ) : (
                <>
                  + Add Screen
                </>
              )}
            </button>

            <button
              type="button"
              className="reset-btn"
              onClick={resetForm}
            >
              Reset
            </button>

          </div>

        </form>

      </div>


      {/* =================================
          SCREEN LIST
      ================================= */}
      <div className="screens-section">

        <div className="section-heading">

          <div>

            <span className="section-label">
              CINEMA CONFIGURATION
            </span>

            <h2>
              All Screens
            </h2>

            <p>
              Manage every configured cinema screen.
            </p>

          </div>

          <div className="screen-total-pill">
            {screens.length} Screens
          </div>

        </div>


        {screens.length === 0 ? (

          <div className="empty-screen">

            <div className="empty-icon">
              🎬
            </div>

            <h3>
              No Screens Found
            </h3>

            <p>
              Add your first cinema screen to
              get started.
            </p>

          </div>

        ) : (

          <div className="screen-grid">

            {screens.map((screen) => (

              <div
                className="screen-card"
                key={screen._id}
              >

                {/* CARD TOP */}
                <div className="card-top">

                  <div className="screen-card-title">

                    <div className="movie-screen-icon">
                      🎥
                    </div>

                    <div>

                      <span>
                        CINEMA SCREEN
                      </span>

                      <h3>
                        {screen.name}
                      </h3>

                    </div>

                  </div>

                  <span className="screen-type">
                    {screen.screenType}
                  </span>

                </div>


                {/* THEATRE */}
                <div className="theatre-name">

                  <span>
                    ◉
                  </span>

                  {getTheatreName(screen)}

                </div>


                {/* STATS */}
                <div className="screen-stats">

                  <div className="stat-item">

                    <span>
                      ROWS
                    </span>

                    <strong>
                      {screen.rows}
                    </strong>

                  </div>

                  <div className="stat-item">

                    <span>
                      SEATS / ROW
                    </span>

                    <strong>
                      {screen.seatsPerRow}
                    </strong>

                  </div>

                  <div className="stat-item highlight-stat">

                    <span>
                      TOTAL
                    </span>

                    <strong>
                      {screen.totalSeats}
                    </strong>

                  </div>

                </div>


                {/* PROGRESS */}
                <div className="capacity-bar">

                  <div className="capacity-bar-top">

                    <span>
                      Seating Capacity
                    </span>

                    <strong>
                      {screen.totalSeats} seats
                    </strong>

                  </div>

                  <div className="bar">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${Math.min(
                          Number(screen.totalSeats) / 10,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>

                </div>


                {/* ACTIONS */}
                <div className="card-actions">

                  <button
                    className="edit-btn"
                    onClick={() =>
                      handleEdit(screen)
                    }
                  >
                    ✎ Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(screen._id)
                    }
                  >
                    🗑 Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default AdminScreen;
