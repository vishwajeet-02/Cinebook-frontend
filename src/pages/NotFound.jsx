import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="not-found">

      <div className="not-found-content">

        <span>🎬</span>

        <h1>404</h1>

        <h2>Page Not Found</h2>

        <p>
          Sorry, the page you're looking for
          doesn't exist.
        </p>

        <Link to="/">
          ← Back to Home
        </Link>

      </div>

    </main>
  );
};

export default NotFound;