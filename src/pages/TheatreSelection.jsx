import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const TheatreSelection = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [theatreRes, showRes, movieRes] = await Promise.all([
          api.get("/theatres"),
          api.get("/shows"),
          api.get(`/movies/${movieId}`),
        ]);

        setTheatres(theatreRes.data);
        setShows(showRes.data);
        setMovie(movieRes.data);
      } catch (error) {
        console.log("Theatre Selection Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [movieId]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader"></div>
        <p>Finding theatres...</p>
      </div>
    );
  }

  const movieShows = shows.filter(
    (show) => show.movie?._id === movieId || show.movie === movieId
  );

  const getTheatreShows = (theatreId) => {
    return movieShows.filter(
      (show) =>
        show.theatre?._id === theatreId ||
        show.theatre === theatreId
    );
  };

  return (
    <main className="theatre-page">

      {/* Header */}
      <section className="theatre-header">
        <div>
          <span className="page-label">CINEBOOK</span>

          <h1>
            Select your <span>theatre</span>
          </h1>

          {movie && (
            <p>
              Choose a theatre and showtime for{" "}
              <strong>{movie.title}</strong>
            </p>
          )}
        </div>
      </section>

      {/* Theatres */}
      <section className="theatre-container">

        {theatres.length === 0 ? (
          <div className="empty-state">
            <div>🎬</div>
            <h2>No theatres available</h2>
            <p>Please try again later.</p>
          </div>
        ) : (
          theatres.map((theatre) => {

            const theatreShows = getTheatreShows(theatre._id);

            return (
              <div
                className="theatre-card"
                key={theatre._id}
              >

                {/* Theatre information */}
                <div className="theatre-info">

                  <div className="theatre-icon">
                    🎦
                  </div>

                  <div>
                    <h2>{theatre.name}</h2>

                    <p className="theatre-address">
                      📍 {theatre.address}, {theatre.city}
                    </p>

                    {theatre.facilities?.length > 0 && (
                      <div className="facility-list">
                        {theatre.facilities.map(
                          (facility, index) => (
                            <span key={index}>
                              {facility}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* Shows */}
                <div className="show-area">

                  <h3>Available Shows</h3>

                  {theatreShows.length === 0 ? (
                    <p className="no-show">
                      No shows available for this movie.
                    </p>
                  ) : (
                    <div className="show-list">

                      {theatreShows.map((show) => (

                        <button
                          key={show._id}
                          className="show-time-btn"
                          onClick={() =>
                            navigate(`/show/${show._id}`)
                          }
                        >

                          <strong>
                            {show.startTime}
                          </strong>

                          <span>
                            {show.format || "2D"}
                          </span>

                          <small>
                            ₹{show.price}
                          </small>

                        </button>

                      ))}

                    </div>
                  )}

                </div>

              </div>
            );
          })
        )}

      </section>

    </main>
  );
};

export default TheatreSelection;