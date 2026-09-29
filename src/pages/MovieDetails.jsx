import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMovie = async () => {
      try {
        const res = await api.get(`/movies/${id}`);
        setMovie(res.data);
      } catch (error) {
        console.log("Movie Error:", error);
      } finally {
        setLoading(false);
      }
    };

    getMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <h2>Loading movie...</h2>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="page-container">
        <h2>Movie not found</h2>
      </div>
    );
  }

  return (
    <main className="movie-details-page">

      <section className="movie-details">

        <div className="movie-details-poster">
          <img
            src={movie.poster}
            alt={movie.title}
          />
        </div>

        <div className="movie-details-content">

          <span className="movie-label">
            NOW SHOWING
          </span>

          <h1>{movie.title}</h1>

          <div className="movie-meta">
            <span>⭐ {movie.rating || "N/A"}</span>
            <span>🎭 {movie.genre || "Drama"}</span>
            <span>🌐 {movie.language || "English"}</span>
            <span>⏱ {movie.duration || "N/A"} min</span>
          </div>

          <p className="movie-description">
            {movie.description ||
              "Experience this movie in the ultimate cinematic environment with CineBook."}
          </p>

          <button
            className="primary-book-btn"
            onClick={() =>
              navigate(`/movie/${movie._id}/theatres`)
            }
          >
            🎟 Book Tickets
          </button>

        </div>

      </section>

    </main>
  );
};

export default MovieDetails;