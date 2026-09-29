import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">

          <Link to="/" className="footer-logo">
            🎬 Cine<span>Book</span>
          </Link>

          <p>
            Your ultimate movie booking experience.
            Discover movies, choose your favourite theatre,
            select your seats and enjoy the show.
          </p>

          {/* Social Media */}
          <div className="footer-socials">

            {/* Facebook */}
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              title="Facebook"
            >
              f
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              ◎
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              title="X"
            >
              𝕏
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              title="YouTube"
            >
              ▶
            </a>

          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/movies">Movies</Link>
          <Link to="/bookings">My Bookings</Link>
          <Link to="/profile">Profile</Link>
        </div>

        {/* Support */}
        <div className="footer-column">
          <h3>Support</h3>

          <a href="#help">Help Center</a>
          <a href="#contact">Contact Us</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms & Conditions</a>
        </div>

        {/* Newsletter */}
        <div className="footer-column newsletter">

          <h3>Stay Updated</h3>

          <p>
            Get the latest movie releases,
            offers and updates.
          </p>

          <div className="newsletter-box">

            <input
              type="email"
              placeholder="Enter your email"
            />

            <button type="button">
              →
            </button>

          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} CineBook.
          All rights reserved.
        </p>

        <p>
          Made with ❤️ for movie lovers
        </p>

      </div>
    </footer>
  );
};

export default Footer;