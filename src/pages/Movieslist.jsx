import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./MoviesList.css";

const MoviesList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const res = await api.get("/movies");
        setMovies(res.data);
      } catch (error) {
        console.log("Movies List Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  if (loading) {
    return (
      <div className="movies-list-loading">
        <div className="loader"></div>
        <p>Loading movies...</p>
      </div>
    );
  }

  return (
    <main className="movies-list-page">

      <section className="movies-list-header">
        <span className="page-label">CINEBOOK</span>
        <h1>
          All <span>movies</span>
        </h1>
        <p>Browse everything currently showing.</p>
      </section>

      <section className="movies-grid">

        {movies.length === 0 ? (
          <div className="empty-state">
            <div>🎬</div>
            <h2>No movies available</h2>
            <p>Please check back later.</p>
          </div>
        ) : (
          movies.map((movie) => (
            <Link
              to={`/movie/${movie._id}`}
              className="poster-card"
              key={movie._id}
            >
              <div className="poster-card-poster">
                {movie.poster ? (
                  <img src={movie.poster} alt={movie.title} />
                ) : (
                  <div className="poster-placeholder">🎬</div>
                )}

                <div className="poster-card-meta">
                  <span>⭐ {movie.rating || "N/A"}</span>
                  <span>{movie.genre}</span>
                </div>
              </div>

              <div className="poster-card-info">
                <h3>{movie.title}</h3>
                <p>{movie.language || "English"}</p>
              </div>
            </Link>
          ))
        )}

      </section>

    </main>
  );
};

export default MoviesList;
