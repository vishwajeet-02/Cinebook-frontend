import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSlider.css";

const SLIDE_DURATION = 5000; // 5 seconds per slide

const HeroSlider = ({ movies = [] }) => {
  const navigate = useNavigate();

  // Take the first 3 movies as featured banners
  const slides = movies.slice(0, 3);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-advance, paused on hover so a user reading a slide
  // doesn't get it yanked away mid-read
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(goToNext, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [goToNext, isPaused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className="hero-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="hero-slides">
        {slides.map((movie, index) => (
          <div
            key={movie._id}
            className={`hero-slide ${index === activeIndex ? "active" : ""}`}
            aria-hidden={index !== activeIndex}
          >
            {/* Backdrop image */}
            <div className="hero-slide-bg">
              {movie.poster && (
                <img src={movie.poster} alt="" aria-hidden="true" />
              )}
            </div>

            {/* Content */}
            <div className="hero-slide-content">
              <span className="hero-slide-label">NOW SHOWING</span>

              <h1>{movie.title}</h1>

              <div className="hero-slide-meta">
                {movie.rating && <span>⭐ {movie.rating}</span>}
                {movie.genre && (
                  <span>
                    🎭{" "}
                    {Array.isArray(movie.genre)
                      ? movie.genre.join(", ")
                      : movie.genre}
                  </span>
                )}
                {movie.language && <span>🌐 {movie.language}</span>}
                {movie.duration && <span>⏱ {movie.duration} min</span>}
              </div>

              <p className="hero-slide-desc">
                {movie.description ||
                  "Experience this movie in the ultimate cinematic environment with CineBook."}
              </p>

              <div className="hero-slide-actions">
                <button
                  className="hero-book-btn"
                  onClick={() => navigate(`/movie/${movie._id}`)}
                >
                  🎟 Book Tickets
                </button>

                <button
                  className="hero-details-btn"
                  onClick={() => navigate(`/movie/${movie._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Poster card floating on the right */}
            <div className="hero-slide-poster">
              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} />
              ) : (
                <div className="hero-poster-fallback">🎬</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            className="hero-arrow prev"
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            ‹
          </button>

          <button
            className="hero-arrow next"
            onClick={goToNext}
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}

      {/* Progress dots */}
      {slides.length > 1 && (
        <div className="hero-dots">
          {slides.map((movie, index) => (
            <button
              key={movie._id}
              className={`hero-dot ${index === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className="hero-dot-fill"
                style={{
                  animationDuration: `${SLIDE_DURATION}ms`,
                  animationPlayState: isPaused ? "paused" : "running"
                }}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
