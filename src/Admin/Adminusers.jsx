import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminUsers.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.log("Admin Users Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update user");
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span>SYSTEM</span>
          <h1>Users</h1>
          <p>Everyone registered on CineBook.</p>
        </div>

        <div className="admin-page-actions">
          <input
            className="admin-search-input"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="admin-table-empty">No users found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="admin-row-user">
                      <div className="admin-avatar">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <span className="admin-cell-primary">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="admin-cell-muted">{user.email}</td>
                  <td>
                    <span className="admin-badge gold">
                      {user.role || "user"}
                    </span>
                  </td>
                  <td className="admin-cell-muted">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                  <td>
                    {user.isActive !== false ? (
                      <span className="admin-badge success">● Active</span>
                    ) : (
                      <span className="admin-badge danger">● Blocked</span>
                    )}
                  </td>
                  <td>
                    <button
                      className={
                        user.isActive !== false
                          ? "admin-btn danger-outline"
                          : "admin-btn gold"
                      }
                      onClick={() => toggleStatus(user._id)}
                    >
                      {user.isActive !== false ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
