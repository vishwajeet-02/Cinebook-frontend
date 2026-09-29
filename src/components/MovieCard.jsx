import { Link } from "react-router-dom";

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card">

      {/* Poster */}
      <div className="movie-poster">

        <img
          src={movie.poster}
          alt={movie.title}
        />

        {/* Rating */}
        <div className="movie-rating">
          ⭐ {movie.rating || "N/A"}
        </div>

        {/* Overlay */}
        <div className="movie-overlay">
          <Link
            to={`/movie/${movie._id}`}
            className="quick-view-btn"
          >
            View Details
          </Link>
        </div>

      </div>

      {/* Movie Information */}
      <div className="movie-info">

        <h3>
          {movie.title}
        </h3>

        <p className="movie-meta-text">
          {movie.genre || "Movie"}
          {" • "}
          {movie.language || "English"}
        </p>

        <div className="movie-bottom">

          <span className="movie-duration">
            ⏱ {movie.duration || "N/A"} min
          </span>

          <Link
            to={`/movie/${movie._id}`}
            className="book-btn"
          >
            Book Now
          </Link>

        </div>

      </div>

    </div>
  );
};

export default MovieCard;