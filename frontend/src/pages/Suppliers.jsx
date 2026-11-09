import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, X, Search } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Tracks if we are editing
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    telephone: "",
    address: "",
    vatNo: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open modal for a NEW supplier
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", telephone: "", address: "", vatNo: "" });
    setIsModalOpen(true);
  };

  // Open modal to EDIT an existing supplier
  const openEditModal = (supplier) => {
    setEditingId(supplier._id);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      telephone: supplier.telephone,
      address: supplier.address,
      vatNo: supplier.vatNo || "",
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
      if (editingId) {
        // Update existing supplier
        await axios.put(`${API_URL}/api/suppliers/${editingId}`, formData);
      } else {
        // Create new supplier
        await axios.post(`${API_URL}/api/suppliers`, formData);
      }
      closeModal();
      fetchSuppliers(); // Refresh the table
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert(error.response?.data?.message || "Error saving supplier");
    }
  };

  // Filter suppliers by Name or Telephone Number
  const filteredSuppliers = suppliers.filter((supplier) => {
    const query = searchTerm.toLowerCase();
    const nameMatch = supplier.name?.toLowerCase().includes(query);
    const phoneMatch = supplier.telephone?.toLowerCase().includes(query);
    return nameMatch || phoneMatch;
  });

  // Reset to page 1 on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination slice calculations (max 20 per page)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage) || 1;

  return (
    <div
      className="page-container"
      style={{ width: "100%", boxSizing: "border-box" }}
    >
      <div className="page-header">
        <h1>Supplier Management</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add Supplier
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
            placeholder="Search by supplier name or telephone..."
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
              title="Clear search"
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
              <th>Name</th>
              <th>Email</th>
              <th>Telephone</th>
              <th>Address</th>
              <th>VAT No.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliers.map((supplier) => (
              <tr key={supplier._id}>
                <td>{supplier.name}</td>
                <td>{supplier.email}</td>
                <td>{supplier.telephone}</td>
                <td>{supplier.address}</td>
                <td>{supplier.vatNo || "-"}</td>
                <td>
                  {/* Edit Button triggers openEditModal */}
                  <button
                    className="btn-icon text-blue"
                    onClick={() => openEditModal(supplier)}
                    title="Edit Supplier"
                  >
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {currentSuppliers.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  {suppliers.length === 0
                    ? "No suppliers found. Add your first supplier!"
                    : "No suppliers match your search criteria."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1.5rem",
            padding: "0.5rem 0",
          }}
        >
          <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredSuppliers.length)} of{" "}
            {filteredSuppliers.length} entries
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                padding: "0 0.5rem",
              }}
            >
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={{
                opacity: currentPage === totalPages ? 0.5 : 1,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Shared Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              {/* Dynamic Modal Title */}
              <h2>{editingId ? "Edit Supplier" : "Add New Supplier"}</h2>
              <button className="btn-icon" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label>Supplier Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Telephone *</label>
                <input
                  type="text"
                  name="telephone"
                  required
                  value={formData.telephone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>VAT Number (Optional)</label>
                <input
                  type="text"
                  name="vatNo"
                  value={formData.vatNo}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group full-width">
                <label>Physical Address *</label>
                <textarea
                  name="address"
                  required
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="form-actions full-width">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                {/* Dynamic Button Text */}
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update Supplier" : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
