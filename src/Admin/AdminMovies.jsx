import { useEffect, useState } from "react";
import api from "../services/api";

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [search, setSearch] = useState("");

  // NEW: tracks the AI description generation request
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    genre: "",
    language: "Hindi",
    duration: "",
    rating: "",
    poster: "",
    releaseDate: "",
  });

  const getMovies = async () => {
    try {
      const res = await api.get("/movies");
      setMovies(res.data || []);
    } catch (error) {
      console.log("Movies Error:", error);
      alert(
        error.response?.data?.message ||
        "Unable to load movies"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMovies();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      genre: "",
      language: "Hindi",
      duration: "",
      rating: "",
      poster: "",
      releaseDate: "",
    });

    setEditingMovie(null);
    setShowForm(false);
  };

  // NEW: calls the AI endpoint using whatever the admin has typed
  // into Title/Genre/Language so far, and fills the description
  // field with the result (which they can still edit before saving).
  const handleGenerateDescription = async () => {
    if (!form.title.trim()) {
      alert("Enter a movie title first so the AI knows what to write about.");
      return;
    }

    setGeneratingDescription(true);

    try {
      const res = await api.post("/admin/generate-description", {
        title: form.title,
        genre: form.genre,
        language: form.language,
      });

      setForm((prev) => ({
        ...prev,
        description: res.data.description,
      }));
    } catch (error) {
      console.log("Generate Description Error:", error);
      alert(
        error.response?.data?.message ||
        "Unable to generate a description right now."
      );
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingMovie) {
        await api.put(
          `/movies/${editingMovie._id}`,
          form
        );

        alert("Movie updated successfully");
      } else {
        await api.post("/movies", form);

        alert("Movie added successfully");
      }

      resetForm();
      getMovies();

    } catch (error) {
      console.log("Movie Save Error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to save movie"
      );
    }
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);

    setForm({
      title: movie.title || "",
      description: movie.description || "",
      genre: movie.genre || "",
      language: movie.language || "Hindi",
      duration: movie.duration || "",
      rating: movie.rating || "",
      poster: movie.poster || "",
      releaseDate: movie.releaseDate
        ? new Date(movie.releaseDate).toISOString().split("T")[0]
        : "",
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this movie?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/movies/${id}`);

      alert("Movie deleted successfully");

      getMovies();

    } catch (error) {
      console.log("Delete Error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to delete movie"
      );
    }
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">

      {/* Header */}

      <div className="admin-page-header">

        <div>
          <span>CONTENT MANAGEMENT</span>

          <h2>
            Movies
          </h2>

          <p>
            Manage movies available on CineBook.
          </p>
        </div>

        <button
          className="admin-primary-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Movie
        </button>

      </div>


      {/* Search */}

      <div className="admin-toolbar">

        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <span>
          {filteredMovies.length} Movies
        </span>

      </div>


      {/* Form */}

      {showForm && (
        <div className="admin-form-panel">

          <div className="admin-form-header">

            <div>
              <span>MOVIE</span>

              <h3>
                {editingMovie
                  ? "Edit Movie"
                  : "Add New Movie"}
              </h3>
            </div>

            <button onClick={resetForm}>
              ✕
            </button>

          </div>

          <form
            className="admin-movie-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">
              <label>Movie Title</label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter movie title"
                required
              />
            </div>


            <div className="form-group">
              <label>Genre</label>

              <input
                name="genre"
                value={form.genre}
                onChange={handleChange}
                placeholder="Action, Drama..."
              />
            </div>


            <div className="form-group">
              <label>Language</label>

              <select
                name="language"
                value={form.language}
                onChange={handleChange}
              >
                <option>Hindi</option>
                <option>English</option>
                <option>Tamil</option>
                <option>Telugu</option>
                <option>Malayalam</option>
              </select>
            </div>


            <div className="form-group">
              <label>Duration</label>

              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="Minutes"
                required
              />
            </div>


            <div className="form-group">
              <label>Release Date</label>

              <input
                type="date"
                name="releaseDate"
                value={form.releaseDate}
                onChange={handleChange}
                required
              />
            </div>


            <div className="form-group">
              <label>Rating</label>

              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                name="rating"
                value={form.rating}
                onChange={handleChange}
                placeholder="8.5"
              />
            </div>


            <div className="form-group">
              <label>Poster URL</label>

              <input
                name="poster"
                value={form.poster}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>


            <div className="form-group full">
              <div className="form-label-row">
                <label>Description</label>

                {/* NEW: AI generate button */}
                <button
                  type="button"
                  className="ai-generate-btn"
                  onClick={handleGenerateDescription}
                  disabled={generatingDescription}
                >
                  {generatingDescription
                    ? "✨ Generating..."
                    : "✨ Generate with AI"}
                </button>
              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter movie description, or click 'Generate with AI' above..."
                rows="4"
                required
              />
            </div>


            <div className="admin-form-actions">

              <button
                type="button"
                className="admin-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-primary-btn"
              >
                {editingMovie
                  ? "Update Movie"
                  : "Add Movie"}
              </button>

            </div>

          </form>

        </div>
      )}


      {/* Movie Table */}

      <div className="admin-table-panel">

        {loading ? (

          <div className="admin-loading">
            Loading movies...
          </div>

        ) : filteredMovies.length === 0 ? (

          <div className="admin-empty">
            <div>🎬</div>

            <h3>
              No movies found
            </h3>

            <p>
              Add your first movie to CineBook.
            </p>
          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Genre</th>
                  <th>Language</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredMovies.map((movie) => (

                  <tr key={movie._id}>

                    <td>

                      <div className="admin-movie-cell">

                        {movie.poster ? (
                          <img
                            src={movie.poster}
                            alt={movie.title}
                          />
                        ) : (
                          <div className="admin-poster-placeholder">
                            🎬
                          </div>
                        )}

                        <div>
                          <strong>
                            {movie.title}
                          </strong>

                          <small>
                            ID: {movie._id}
                          </small>
                        </div>

                      </div>

                    </td>

                    <td>
                      {movie.genre || "—"}
                    </td>

                    <td>
                      {movie.language || "—"}
                    </td>

                    <td>
                      {movie.duration
                        ? `${movie.duration} min`
                        : "—"}
                    </td>

                    <td>
                      ⭐ {movie.rating || "N/A"}
                    </td>

                    <td>

                      <div className="admin-action-buttons">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleEdit(movie)
                          }
                        >
                          ✏️
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(movie._id)
                          }
                        >
                          🗑️
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default AdminMovies;
