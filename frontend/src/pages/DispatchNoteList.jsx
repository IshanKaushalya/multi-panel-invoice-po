import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Eye, X, Printer, Search } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import DispatchNotePrintTemplate from "../components/DispatchNotePrintTemplate";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DispatchNoteList = () => {
  const [dispatchNotes, setDispatchNotes] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const printRef = useRef();

  useEffect(() => {
    fetchDispatchNotes();
    fetchSettings();
  }, []);

  const fetchDispatchNotes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/dispatch-notes`);
      setDispatchNotes(response.data);
    } catch (error) {
      console.error("Error fetching dispatch notes:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const openViewModal = (note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedNote
      ? `${selectedNote.dispatchNo}`
      : "Dispatch_Note",
  });

  // Filter dispatch notes by Dispatch No. or Invoice No.
  const filteredNotes = dispatchNotes.filter((note) => {
    const query = searchTerm.toLowerCase();
    const dispatchNoMatch = note.dispatchNo?.toLowerCase().includes(query);
    const invoiceNoMatch = note.invoiceNo?.toLowerCase().includes(query);
    return dispatchNoMatch || invoiceNoMatch;
  });

  // Reset to page 1 on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination slice calculations (max 20 per page)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage) || 1;

  return (
    <div
      className="page-container"
      style={{ width: "100%", boxSizing: "border-box" }}
    >
      <div className="page-header">
        <div>
          <h1>Dispatch Notes</h1>
          <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
            Automatically generated from Invoices.
          </p>
        </div>
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
            placeholder="Search by Dispatch No. or Invoice No..."
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
              <th>Dispatch No.</th>
              <th>Linked Invoice No.</th>
              <th>Purchasing No.</th>
              <th>Date</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentNotes.map((note) => (
              <tr key={note._id}>
                <td>
                  <strong>{note.dispatchNo}</strong>
                </td>
                <td>{note.invoiceNo}</td>
                <td>{note.purchasingNo || "-"}</td>
                <td>{note.date}</td>
                <td>{note.time}</td>
                <td>
                  <button
                    className="btn-icon text-blue"
                    onClick={() => openViewModal(note)}
                    title="View Dispatch Note"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {currentNotes.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  {dispatchNotes.length === 0
                    ? "No Dispatch Notes found. Generate an invoice to create one!"
                    : "No dispatch notes match your search criteria."}
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
            {Math.min(indexOfLastItem, filteredNotes.length)} of{" "}
            {filteredNotes.length} entries
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

      {/* VIEW MODAL (SCROLLABLE) */}
      {isModalOpen && selectedNote && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{
              maxWidth: "800px",
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className="modal-header">
              <h2>Dispatch Note: {selectedNote.dispatchNo}</h2>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button className="btn btn-primary" onClick={handlePrint}>
                  <Printer size={18} /> Print A4
                </button>
                <button className="btn-icon" onClick={closeModal}>
                  <X size={24} />
                </button>
              </div>
            </div>

            <div
              style={{
                marginBottom: "1.5rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                background: "#f9fafb",
                padding: "1rem",
                borderRadius: "8px",
              }}
            >
              <div>
                <p>
                  <strong>Date:</strong> {selectedNote.date}
                </p>
                <p>
                  <strong>Time:</strong> {selectedNote.time}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p>
                  <strong>Reference Invoice:</strong> {selectedNote.invoiceNo}
                </p>
                <p>
                  <strong>Purchasing No:</strong>{" "}
                  {selectedNote.purchasingNo || "-"}
                </p>
              </div>
            </div>

            <h3
              style={{
                marginBottom: "1rem",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "0.5rem",
              }}
            >
              Dispatched Items
            </h3>
            <div className="table-container" style={{ marginBottom: "1.5rem" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px", textAlign: "center" }}>#</th>
                    <th>Item Description</th>
                    <th width="100" style={{ textAlign: "center" }}>
                      Unit
                    </th>
                    <th width="150" style={{ textAlign: "center" }}>
                      Dispatch Quantity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedNote.items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td>{item.description}</td>
                      <td style={{ textAlign: "center" }}>
                        {item.unitType || "NOS"}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: "bold" }}>
                        {item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* REMARKS DISPLAY */}
            <div
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <strong>Remarks:</strong>
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  color: "#4b5563",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedNote.remarks && selectedNote.remarks.trim() !== ""
                  ? selectedNote.remarks
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT COMPONENT */}
      <div className="print-source-hidden">
        <DispatchNotePrintTemplate
          ref={printRef}
          note={selectedNote}
          settings={settings}
        />
      </div>
    </div>
  );
};

export default DispatchNoteList;
