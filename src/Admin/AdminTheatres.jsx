import { useEffect, useState } from "react";
import api from "../services/api";

const AdminTheatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    facilities: "",
    isActive: true,
  });

  const getTheatres = async () => {
    try {
      const res = await api.get("/theatres");
      setTheatres(res.data || []);
    } catch (error) {
      console.log("Theatre Error:", error);
      alert(
        error.response?.data?.message ||
          "Unable to load theatres"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTheatres();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      city: "",
      address: "",
      facilities: "",
      isActive: true,
    });

    setEditingTheatre(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const theatreData = {
        name: form.name,
        city: form.city,
        address: form.address,
        facilities: form.facilities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        isActive: form.isActive,
      };

      if (editingTheatre) {
        await api.put(
          `/theatres/${editingTheatre._id}`,
          theatreData
        );

        alert("Theatre updated successfully");
      } else {
        await api.post("/theatres", theatreData);

        alert("Theatre added successfully");
      }

      resetForm();
      getTheatres();
    } catch (error) {
      console.log("Theatre Save Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to save theatre"
      );
    }
  };

  const handleEdit = (theatre) => {
    setEditingTheatre(theatre);

    setForm({
      name: theatre.name || "",
      city: theatre.city || "",
      address: theatre.address || "",
      facilities: theatre.facilities?.join(", ") || "",
      isActive: theatre.isActive ?? true,
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this theatre?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/theatres/${id}`);

      alert("Theatre deleted successfully");

      getTheatres();
    } catch (error) {
      console.log("Delete Theatre Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete theatre"
      );
    }
  };

  const filteredTheatres = theatres.filter((theatre) => {
    const text = `${theatre.name} ${theatre.city} ${theatre.address}`;

    return text
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div className="admin-page">

      {/* HEADER */}
      <div className="admin-page-header">

        <div>
          <span>THEATRE MANAGEMENT</span>

          <h2>Theatres</h2>

          <p>
            Manage CineBook theatres and their facilities.
          </p>
        </div>

        <button
          className="admin-primary-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Theatre
        </button>

      </div>

      {/* TOOLBAR */}
      <div className="admin-toolbar">

        <input
          type="text"
          placeholder="Search theatre or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span>
          {filteredTheatres.length} Theatres
        </span>

      </div>

      {/* FORM */}
      {showForm && (
        <div className="admin-form-panel">

          <div className="admin-form-header">

            <div>
              <span>THEATRE</span>

              <h3>
                {editingTheatre
                  ? "Edit Theatre"
                  : "Add New Theatre"}
              </h3>
            </div>

            <button onClick={resetForm}>
              ✕
            </button>

          </div>

          <form
            className="admin-theatre-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}
            <div className="form-group">

              <label>Theatre Name</label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Cinepolis DB City"
                required
              />

            </div>

            {/* CITY */}
            <div className="form-group">

              <label>City</label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Bhopal"
                required
              />

            </div>

            {/* ADDRESS */}
            <div className="form-group full">

              <label>Address</label>

              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="DB City Mall, Maharana Pratap Nagar"
                required
              />

            </div>

            {/* FACILITIES */}
            <div className="form-group full">

              <label>
                Facilities
              </label>

              <input
                name="facilities"
                value={form.facilities}
                onChange={handleChange}
                placeholder="Parking, Food Court, Dolby Atmos, Wheelchair Accessible"
              />

              <small>
                Separate facilities using commas.
              </small>

            </div>

            {/* ACTIVE */}
            <div className="form-checkbox">

              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                id="isActive"
              />

              <label htmlFor="isActive">
                Theatre is Active
              </label>

            </div>

            {/* ACTIONS */}
            <div className="admin-form-actions">

              <button
                type="button"
                className="admin-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-primary-btn"
              >
                {editingTheatre
                  ? "Update Theatre"
                  : "Add Theatre"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* TABLE */}
      <div className="admin-table-panel">

        {loading ? (
          <div className="admin-loading">
            Loading theatres...
          </div>
        ) : filteredTheatres.length === 0 ? (

          <div className="admin-empty">

            <div>🎦</div>

            <h3>No theatres found</h3>

            <p>
              Add your first theatre to CineBook.
            </p>

          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Theatre</th>
                  <th>City</th>
                  <th>Address</th>
                  <th>Facilities</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredTheatres.map((theatre) => (

                  <tr key={theatre._id}>

                    <td>

                      <div className="admin-theatre-cell">

                        <div className="theatre-table-icon">
                          🎦
                        </div>

                        <div>
                          <strong>
                            {theatre.name}
                          </strong>

                          <small>
                            ID: {theatre._id}
                          </small>
                        </div>

                      </div>

                    </td>

                    <td>
                      📍 {theatre.city}
                    </td>

                    <td>
                      {theatre.address}
                    </td>

                    <td>

                      <div className="facility-table-list">

                        {theatre.facilities?.map(
                          (facility, index) => (
                            <span key={index}>
                              {facility}
                            </span>
                          )
                        )}

                      </div>

                    </td>

                    <td>

                      <span
                        className={`theatre-status ${
                          theatre.isActive
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {theatre.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                    <td>

                      <div className="admin-action-buttons">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleEdit(theatre)
                          }
                        >
                          ✏️
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(theatre._id)
                          }
                        >
                          🗑️
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default AdminTheatres;