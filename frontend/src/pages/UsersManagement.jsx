import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, X, Search, UserCheck, UserX } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    telephone: "",
    role: "staff",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Helper to reliably retrieve the JWT token
  const getAuthToken = () => {
    let token = localStorage.getItem("token");
    if (!token) {
      try {
        const userObj = JSON.parse(localStorage.getItem("user") || "{}");
        token = userObj.token;
      } catch (err) {
        console.error("Failed to parse user storage:", err);
      }
    }
    return token;
  };

  const getAuthConfig = () => {
    const token = getAuthToken();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn("No token found in localStorage. Redirecting to login...");
        window.location.href = "/login";
        return;
      }

      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Session expired or unauthorized. Please log in again.");
        window.location.href = "/login";
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      telephone: "",
      role: "staff",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingId(user._id);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      telephone: user.telephone || "",
      role: user.role || "staff",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = getAuthConfig();

      if (editingId) {
        // If password is left blank during edit, omit it so it doesn't overwrite with an empty hash
        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        await axios.put(`${API_URL}/api/users/${editingId}`, payload, config);
        alert("User updated successfully!");
      } else {
        await axios.post(`${API_URL}/api/users/register`, formData, config);
        alert("User registered successfully!");
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to save user.",
      );
    }
  };

  const toggleBlockUser = async (id, currentStatus) => {
    const action = currentStatus ? "block" : "unblock";
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        const config = getAuthConfig();
        await axios.patch(
          `${API_URL}/api/users/${id}/toggle-block`,
          {},
          config,
        );
        fetchUsers();
      } catch (error) {
        console.error("Error updating user block status:", error);
        alert("Failed to update user status.");
      }
    }
  };

  // Filter users by username, email, or role
  const filteredUsers = users.filter((user) => {
    const query = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  return (
    <div
      className="page-container"
      style={{ width: "100%", boxSizing: "border-box" }}
    >
      <div className="page-header">
        <h1>User Management (Admin)</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Register New User
        </button>
      </div>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: "1.5rem", maxWidth: "400px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            padding: "0 0.75rem",
            background: "white",
          }}
        >
          <Search size={18} color="#6b7280" />
          <input
            type="text"
            placeholder="Search by username, email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "none",
              outline: "none",
              fontSize: "0.9rem",
              background: "transparent",
              color: "#111827",
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Telephone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  <strong>{user.username}</strong>
                </td>
                <td>{user.email}</td>
                <td>{user.telephone || "-"}</td>
                <td>
                  <span
                    style={{
                      textTransform: "capitalize",
                      fontWeight: "600",
                      color:
                        user.role?.toLowerCase() === "admin"
                          ? "#2563eb"
                          : "#4b5563",
                    }}
                  >
                    {user.role}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      backgroundColor:
                        user.isActive !== false ? "#dcfce7" : "#fee2e2",
                      color: user.isActive !== false ? "#166534" : "#991b1b",
                    }}
                  >
                    {user.isActive !== false ? "Active" : "Blocked"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn-icon text-blue"
                      onClick={() => openEditModal(user)}
                      title="Edit User"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() =>
                        toggleBlockUser(user._id, user.isActive !== false)
                      }
                      style={{
                        color: user.isActive !== false ? "#ef4444" : "#10b981",
                      }}
                      title={
                        user.isActive !== false ? "Block User" : "Unblock User"
                      }
                    >
                      {user.isActive !== false ? (
                        <UserX size={18} />
                      ) : (
                        <UserCheck size={18} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentUsers.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1.5rem",
          }}
        >
          <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
            {filteredUsers.length} entries
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* REGISTRATION / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h2>{editingId ? "Edit User" : "Register New User"}</h2>
              <button className="btn-icon" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                    color: "#111827",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                    color: "#111827",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Telephone</label>
                <input
                  type="text"
                  value={formData.telephone}
                  onChange={(e) =>
                    setFormData({ ...formData, telephone: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                    color: "#111827",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>
                  {editingId
                    ? "New Password (leave blank to keep current)"
                    : "Password *"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!editingId}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                    color: "#111827",
                    backgroundColor: "#ffffff",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                    color: "#111827",
                    backgroundColor: "#ffffff",
                    textTransform: "capitalize",
                  }}
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div
                className="form-actions"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update User" : "Register User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
