import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./Show.css";

const AdminShows = () => {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [shows, setShows] = useState([]);

  const [formData, setFormData] = useState({
    movie: "",
    theatre: "",
    screen: "",
    showDate: "",
    startTime: "",
    endTime: "",
    screenType: "2D",
    price: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH MOVIES
  // =========================
  const fetchMovies = async () => {
    try {
      const res = await api.get("/movies");

      setMovies(
        Array.isArray(res.data)
          ? res.data
          : res.data.movies || []
      );
    } catch (error) {
      console.error("Movie fetch error:", error);
    }
  };

  // =========================
  // FETCH THEATRES
  // =========================
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

  // =========================
  // FETCH SCREENS
  // =========================
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

  // =========================
  // FETCH SHOWS
  // =========================
  const fetchShows = async () => {
    try {
      const res = await api.get("/shows");

      setShows(
        Array.isArray(res.data)
          ? res.data
          : res.data.shows || []
      );
    } catch (error) {
      console.error("Show fetch error:", error);
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchTheatres();
    fetchScreens();
    fetchShows();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Theatre change hone par screen reset
    if (name === "theatre") {
      setFormData((prev) => ({
        ...prev,
        theatre: value,
        screen: "",
      }));
    }

    // Screen select hone par screen ka format automatically set
    if (name === "screen") {
      const selectedScreen = screens.find(
        (screen) => screen._id === value
      );

      if (selectedScreen) {
        setFormData((prev) => ({
          ...prev,
          screen: value,
          screenType:
            selectedScreen.screenType || "2D",
        }));
      }
    }
  };

  // =========================
  // FILTER SCREENS
  // =========================
  const filteredScreens = screens.filter((screen) => {
    const theatreId =
      screen.theatre?._id || screen.theatre;

    return theatreId === formData.theatre;
  });

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.movie ||
      !formData.theatre ||
      !formData.screen ||
      !formData.showDate ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.price
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const showData = {
        movie: formData.movie,
        theatre: formData.theatre,
        screen: formData.screen,
        showDate: formData.showDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        screenType: formData.screenType,
        price: Number(formData.price),
      };

      if (editingId) {
        await api.put(`/shows/${editingId}`, showData);

        alert("Show updated successfully!");
      } else {
        await api.post("/shows", showData);

        alert("Show added successfully!");
      }

      resetForm();
      await fetchShows();
    } catch (error) {
      console.error("Show save error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to save show."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (show) => {
    setEditingId(show._id);

    setFormData({
      movie:
        show.movie?._id ||
        show.movie ||
        "",

      theatre:
        show.theatre?._id ||
        show.theatre ||
        "",

      screen:
        show.screen?._id ||
        show.screen ||
        "",

      showDate:
        show.showDate
          ? new Date(show.showDate)
              .toISOString()
              .split("T")[0]
          : "",

      startTime: show.startTime || "",

      endTime: show.endTime || "",

      screenType:
        show.screenType || "2D",

      price:
        show.price || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this show?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/shows/${id}`);

      alert("Show deleted successfully!");

      await fetchShows();
    } catch (error) {
      console.error("Show delete error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete show."
      );
    }
  };

  // =========================
  // RESET
  // =========================
  const resetForm = () => {
    setEditingId(null);

    setFormData({
      movie: "",
      theatre: "",
      screen: "",
      showDate: "",
      startTime: "",
      endTime: "",
      screenType: "2D",
      price: "",
    });
  };

  // =========================
  // HELPERS
  // =========================
  const getMovieName = (show) => {
    if (show.movie?.title) {
      return show.movie.title;
    }

    const movie = movies.find(
      (item) => item._id === show.movie
    );

    return movie?.title || "Unknown Movie";
  };

  const getMoviePoster = (show) => {
    if (show.movie?.poster) {
      return show.movie.poster;
    }

    const movie = movies.find(
      (item) => item._id === show.movie
    );

    return movie?.poster || "";
  };

  const getTheatreName = (show) => {
    if (show.theatre?.name) {
      return show.theatre.name;
    }

    const theatre = theatres.find(
      (item) => item._id === show.theatre
    );

    return theatre?.name || "Unknown Theatre";
  };

  const getScreenName = (show) => {
    if (show.screen?.screenName) {
      return show.screen.screenName;
    }

    const screen = screens.find(
      (item) => item._id === show.screen
    );

    return screen?.screenName || "Unknown Screen";
  };

  return (
    <div className="show-management">

      {/* ================= HEADER ================= */}

      <div className="show-header">
        <div>
          <span className="show-label">
            CINEBOOK ADMIN
          </span>

          <h1>
            Show <span>Management</span>
          </h1>

          <p>
            Create and manage movie shows across
            theatres, screens and schedules.
          </p>
        </div>

        <div className="show-count-card">
          <div className="show-count-icon">
            🎟️
          </div>

          <div>
            <strong>{shows.length}</strong>
            <span>Total Shows</span>
          </div>
        </div>
      </div>

      {/* ================= FORM ================= */}

      <div className="show-form-card">

        <div className="show-form-heading">
          <div>
            <span>
              {editingId
                ? "UPDATE SHOW"
                : "CREATE NEW SHOW"}
            </span>

            <h2>
              {editingId
                ? "Edit Show"
                : "Add New Show"}
            </h2>

            <p>
              Configure movie timing, theatre,
              screen and ticket pricing.
            </p>
          </div>

          {editingId && (
            <button
              className="show-cancel-btn"
              type="button"
              onClick={resetForm}
            >
              ✕ Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>

          <div className="show-form-grid">

            {/* MOVIE */}

            <div className="show-form-group">
              <label>Movie</label>

              <div className="show-input">
                <span>🎬</span>

                <select
                  name="movie"
                  value={formData.movie}
                  onChange={handleChange}
                >
                  <option value="">
                    Select Movie
                  </option>

                  {movies.map((movie) => (
                    <option
                      key={movie._id}
                      value={movie._id}
                    >
                      {movie.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* THEATRE */}

            <div className="show-form-group">
              <label>Theatre</label>

              <div className="show-input">
                <span>🏢</span>

                <select
                  name="theatre"
                  value={formData.theatre}
                  onChange={handleChange}
                >
                  <option value="">
                    Select Theatre
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

            {/* SCREEN */}

            <div className="show-form-group">
              <label>Screen</label>

              <div className="show-input">
                <span>📺</span>

                <select
                  name="screen"
                  value={formData.screen}
                  onChange={handleChange}
                  disabled={!formData.theatre}
                >
                  <option value="">
                    {formData.theatre
                      ? "Select Screen"
                      : "Select Theatre First"}
                  </option>

                  {filteredScreens.map((screen) => (
                    <option
                      key={screen._id}
                      value={screen._id}
                    >
                      {screen.screenName} —{" "}
                      {screen.screenType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DATE */}

            <div className="show-form-group">
              <label>Show Date</label>

              <div className="show-input">
                <span>📅</span>

                <input
                  type="date"
                  name="showDate"
                  value={formData.showDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* START TIME */}

            <div className="show-form-group">
              <label>Start Time</label>

              <div className="show-input">
                <span>🕐</span>

                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* END TIME */}

            <div className="show-form-group">
              <label>End Time</label>

              <div className="show-input">
                <span>🕐</span>

                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* FORMAT */}

            <div className="show-form-group">
              <label>Format</label>

              <div className="show-input">
                <span>✨</span>

                <select
                  name="screenType"
                  value={formData.screenType}
                  onChange={handleChange}
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                  <option value="4DX">4DX</option>
                </select>
              </div>
            </div>

            {/* PRICE */}

            <div className="show-form-group">
              <label>Ticket Price</label>

              <div className="show-input">
                <span>₹</span>

                <input
                  type="number"
                  name="price"
                  min="1"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Example: 250"
                />
              </div>
            </div>

          </div>

          {/* PREVIEW */}

          <div className="show-preview">

            <div className="preview-icon">
              🎥
            </div>

            <div className="preview-info">
              <span>SHOW PREVIEW</span>

              <strong>
                {formData.movie
                  ? getMovieName({
                      movie: formData.movie,
                    })
                  : "Select Movie"}
              </strong>

              <small>
                {formData.theatre
                  ? getTheatreName({
                      theatre: formData.theatre,
                    })
                  : "Select Theatre"}{" "}
                •{" "}
                {formData.screen
                  ? getScreenName({
                      screen: formData.screen,
                    })
                  : "Select Screen"}
              </small>
            </div>

            <div className="preview-time">
              <strong>
                {formData.startTime || "--:--"}
              </strong>

              <span>
                to{" "}
                {formData.endTime || "--:--"}
              </span>
            </div>

            <div className="preview-price">
              ₹{formData.price || 0}
            </div>

          </div>

          {/* BUTTONS */}

          <div className="show-form-buttons">

            <button
              type="submit"
              className="show-primary-btn"
              disabled={loading}
            >
              {loading ? (
                "Saving..."
              ) : editingId ? (
                "✓ Update Show"
              ) : (
                "+ Create Show"
              )}
            </button>

            <button
              type="button"
              className="show-reset-btn"
              onClick={resetForm}
            >
              Reset
            </button>

          </div>

        </form>
      </div>

      {/* ================= SHOW LIST ================= */}

      <div className="shows-section">

        <div className="shows-section-heading">

          <div>
            <span>LIVE CINEMA SCHEDULE</span>

            <h2>All Shows</h2>

            <p>
              Manage all scheduled movie shows.
            </p>
          </div>

          <div className="shows-pill">
            {shows.length} Shows
          </div>

        </div>

        {shows.length === 0 ? (
          <div className="empty-shows">
            <div>🎟️</div>

            <h3>No Shows Found</h3>

            <p>
              Create your first movie show above.
            </p>
          </div>
        ) : (
          <div className="show-grid">

            {shows.map((show) => (

              <div
                className="show-card"
                key={show._id}
              >

                <div className="show-card-top">

                  <div className="poster-box">

                    {getMoviePoster(show) ? (
                      <img
                        src={getMoviePoster(show)}
                        alt={getMovieName(show)}
                      />
                    ) : (
                      <div className="poster-placeholder">
                        🎬
                      </div>
                    )}

                  </div>

                  <div className="show-card-info">

                    <span>MOVIE SHOW</span>

                    <h3>
                      {getMovieName(show)}
                    </h3>

                    <p>
                      🏢{" "}
                      {getTheatreName(show)}
                    </p>

                    <p>
                      📺{" "}
                      {getScreenName(show)}
                    </p>

                  </div>

                  <div className="format-badge">
                    {show.screenType}
                  </div>

                </div>

                <div className="show-details">

                  <div>
                    <span>DATE</span>

                    <strong>
                      {show.showDate
                        ? new Date(
                            show.showDate
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "--"}
                    </strong>
                  </div>

                  <div>
                    <span>TIME</span>

                    <strong>
                      {show.startTime ||
                        "--:--"}
                    </strong>
                  </div>

                  <div>
                    <span>PRICE</span>

                    <strong>
                      ₹{show.price || 0}
                    </strong>
                  </div>

                </div>

                <div className="show-actions">

                  <button
                    className="show-edit-btn"
                    onClick={() =>
                      handleEdit(show)
                    }
                  >
                    ✎ Edit
                  </button>

                  <button
                    className="show-delete-btn"
                    onClick={() =>
                      handleDelete(
                        show._id
                      )
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

export default AdminShows;