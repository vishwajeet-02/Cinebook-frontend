import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import MovieCard from "../components/MovieCard";
import HeroSlider from "../components/HeroSlider";

const Home = () => {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [recommendations, setRecommendations] = useState([]);
  const [recReason, setRecReason] = useState("");
  const [recLoading, setRecLoading] = useState(true);

  const [smartResults, setSmartResults] = useState(null);
  const [smartExplanation, setSmartExplanation] = useState("");
  const [smartSearching, setSmartSearching] = useState(false);

  // NEW: voice search state + a ref to hold the recognition instance
  // across renders.
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const getMovies = async () => {
      try {
        const res = await api.get("/movies");
        setMovies(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getMovies();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setRecLoading(false);
      return;
    }

    const getRecommendations = async () => {
      try {
        const res = await api.get("/recommendations");
        setRecommendations(res.data.recommendations || []);
        setRecReason(res.data.reason || "");
      } catch (error) {
        console.log("Recommendations error:", error);
      } finally {
        setRecLoading(false);
      }
    };

    getRecommendations();
  }, []);

  // NEW: set up Speech Recognition once. Chrome/Edge expose it as
  // webkitSpeechRecognition; Firefox/Safari don't support it, so the
  // mic button is hidden for them instead of doing nothing silently.
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setSmartResults(null);
    };

    recognition.onerror = (event) => {
      console.log("Voice search error:", event.error);
      setIsListening(false);

      if (event.error === "not-allowed") {
        alert("Microphone access was blocked. Please allow it and try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognitionRef.current.start();
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title?.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) return;

    setSmartSearching(true);
    setSmartResults(null);

    try {
      const res = await api.post("/recommendations/smart-search", {
        query: searchQuery
      });

      setSmartResults(res.data.movies || []);
      setSmartExplanation(res.data.explanation || "");
    } catch (error) {
      console.log("Smart search error:", error);
      alert(
        error.response?.data?.message ||
          "Smart search is unavailable right now."
      );
    } finally {
      setSmartSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSmartResults(null);
    document
      .querySelector(".movies-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleQueryChange = (value) => {
    setSearchQuery(value);
    if (smartResults) setSmartResults(null);
  };

  const displayedMovies = smartResults !== null ? smartResults : filteredMovies;

  return (
    <div>

      {!loading && <HeroSlider movies={movies} />}

      <section className="home-search-section">
        <form className="hero-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder={
              isListening
                ? "Listening..."
                : "Search movies, or ask AI: 'a fun comedy for tonight'..."
            }
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
          />

          {voiceSupported && (
            <button
              type="button"
              className={`voice-search-btn ${isListening ? "listening" : ""}`}
              onClick={handleVoiceSearch}
              title={isListening ? "Stop listening" : "Search by voice"}
              aria-label="Voice search"
            >
              {isListening ? "🔴" : "🎤"}
            </button>
          )}

          <button type="submit">
            🔍 Search
          </button>

          <button
            type="button"
            className="ai-search-btn"
            onClick={handleSmartSearch}
            disabled={smartSearching || !searchQuery.trim()}
          >
            {smartSearching ? "✨ Thinking..." : "✨ Ask AI"}
          </button>
        </form>

        {isListening && (
          <p className="voice-listening-hint">🎙️ Listening... speak now</p>
        )}
      </section>

      {!recLoading && recommendations.length > 0 && (
        <section className="movies-section recommendations-section">
          <div className="section-heading">
            <div>
              <p>✨ PICKED FOR YOU</p>
              <h2>Recommended</h2>
              {recReason && <span className="rec-reason">{recReason}</span>}
            </div>
          </div>

          <div className="movie-grid">
            {recommendations.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      <section className="movies-section">
        <div className="section-heading">
          <div>
            <p>{smartResults !== null ? "✨ AI SEARCH" : "NOW SHOWING"}</p>
            <h2>
              {searchQuery ? `Results for "${searchQuery}"` : "Trending Movies"}
            </h2>
            {smartResults !== null && smartExplanation && (
              <span className="rec-reason">{smartExplanation}</span>
            )}
          </div>

          {smartResults === null && (
            <button onClick={() => navigate("/movies")}>
              View All →
            </button>
          )}
        </div>

        {loading ? (
          <h3>Loading movies...</h3>
        ) : displayedMovies.length === 0 ? (
          <div className="empty-state">
            <div>🎬</div>
            <h2>No movies found</h2>
            <p>
              {smartResults !== null
                ? "Try describing what you're looking for differently."
                : "Try a different search term, or click 'Ask AI' above."}
            </p>
          </div>
        ) : (
          <div className="movie-grid">
            {displayedMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Home;
