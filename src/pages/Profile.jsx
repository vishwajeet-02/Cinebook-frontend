import { useEffect, useState } from "react";
import api from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await api.get("/auth/profile");

        setUser(res.data.user || res.data);
      } catch (error) {
        console.log("Profile Error:", error);

        alert(
          error.response?.data?.message ||
            "Unable to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <h2>Profile not found</h2>
      </div>
    );
  }

  return (
    <main className="profile-page">

      <section className="profile-card">

        <div className="profile-avatar">
          {user.name?.charAt(0).toUpperCase()}
        </div>

        <span className="page-label">
          CINEBOOK MEMBER
        </span>

        <h1>{user.name}</h1>

        <p className="profile-email">
          {user.email}
        </p>

        <div className="profile-info">

          <div>
            <span>Name</span>
            <strong>{user.name}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          {/* <div>
            <span>Role</span>
            <strong>{user.role || "user"}</strong>
          </div> */}

        </div>

      </section>

    </main>
  );
};

export default Profile;