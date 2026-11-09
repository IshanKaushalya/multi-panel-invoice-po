import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  Printer,
  Search,
  CreditCard,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import InvoicePrintTemplate from "../components/InvoicePrintTemplate";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const formatCurrency = (amount) => {
  return `Rs. ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "paid" | "unpaid"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Payment Modal States
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [payingAmount, setPayingAmount] = useState("");

  const navigate = useNavigate();
  const printRef = useRef();

  useEffect(() => {
    fetchInvoices();
    fetchSettings();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/invoices`);
      setInvoices(response.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
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

  // Helper to calculate paid & outstanding credit amounts (supports existing invoices)
  const getPaymentDetails = (invoice) => {
    const grandTotal = Number(invoice.grandTotal || 0);
    let paidAmount = grandTotal;

    if (invoice.paidAmount !== undefined) {
      paidAmount = Number(invoice.paidAmount);
    } else if (invoice.paymentType === "credit") {
      paidAmount = 0;
    }

    const outstanding = Math.max(0, grandTotal - paidAmount);
    const isPaid = outstanding <= 0.01;

    return { grandTotal, paidAmount, outstanding, isPaid };
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this invoice? This action cannot be undone.",
      )
    ) {
      try {
        await axios.delete(`${API_URL}/api/invoices/${id}`);
        fetchInvoices();
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Failed to delete invoice.");
      }
    }
  };

  const openViewModal = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  // Open Payment Modal for Credit Invoices
  const openPayModal = (invoice) => {
    const { outstanding } = getPaymentDetails(invoice);
    setPayingInvoice(invoice);
    setPaymentMethod("cash");
    setPayingAmount(outstanding.toFixed(2));
    setIsPayModalOpen(true);
  };

  const closePayModal = () => {
    setIsPayModalOpen(false);
    setPayingInvoice(null);
    setPayingAmount("");
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payingInvoice) return;

    const { outstanding } = getPaymentDetails(payingInvoice);
    const amountNum = Number(payingAmount);

    if (!amountNum || amountNum <= 0) {
      return alert("Please enter a valid paying amount greater than 0.");
    }
    if (amountNum > outstanding + 0.01) {
      return alert(
        "Paying amount cannot exceed the outstanding credit balance.",
      );
    }

    try {
      await axios.post(`${API_URL}/api/invoices/${payingInvoice._id}/pay`, {
        amount: amountNum,
        method: paymentMethod,
      });
      closePayModal();
      fetchInvoices();
    } catch (error) {
      console.error("Error recording payment:", error);
      alert(error.response?.data?.message || "Failed to record payment.");
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedInvoice ? `${selectedInvoice.invoiceNo}` : "Invoice",
  });

  // Calculate counts for filter tabs
  const paidCount = invoices.filter(
    (inv) => getPaymentDetails(inv).isPaid,
  ).length;
  const unpaidCount = invoices.length - paidCount;

  // Filter invoices by Search Term AND Paid/Unpaid Status
  const filteredInvoices = invoices.filter((invoice) => {
    const query = searchTerm.toLowerCase();
    const invoiceNoMatch = invoice.invoiceNo?.toLowerCase().includes(query);
    const customerNameMatch = invoice.customer?.name
      ?.toLowerCase()
      .includes(query);
    const matchesSearch = invoiceNoMatch || customerNameMatch;

    const { isPaid } = getPaymentDetails(invoice);
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "paid"
          ? isPaid
          : !isPaid;

    return matchesSearch && matchesStatus;
  });

  // Reset to page 1 on search or status filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination slice calculations (max 20 per page)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;

  return (
    <div
      className="page-container"
      style={{ width: "100%", boxSizing: "border-box" }}
    >
      <div className="page-header">
        <h1>Invoice Management</h1>
        <Link
          to="/invoices/new"
          className="btn btn-primary"
          style={{ textDecoration: "none" }}
        >
          <Plus size={18} /> Generate Invoice
        </Link>
      </div>

      {/* SEARCH BAR & STATUS FILTER TABS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Search Input */}
        <div style={{ flex: "1 1 320px", maxWidth: "400px" }}>
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
              placeholder="Search by Invoice No. or Customer Name..."
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

        {/* Paid / Unpaid Filter Buttons */}
        <div
          style={{
            display: "inline-flex",
            background: "#f3f4f6",
            padding: "0.25rem",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            gap: "0.25rem",
          }}
        >
          {[
            { id: "all", label: `All (${invoices.length})` },
            { id: "paid", label: `Paid (${paidCount})` },
            { id: "unpaid", label: `Unpaid / Credit (${unpaidCount})` },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  backgroundColor: isActive ? "#2563eb" : "transparent",
                  color: isActive ? "#ffffff" : "#4b5563",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice No.</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Payment Type</th>
              <th>Grand Total</th>
              <th>Status / Credit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentInvoices.map((invoice) => {
              const { outstanding, isPaid } = getPaymentDetails(invoice);

              return (
                <tr key={invoice._id}>
                  <td>
                    <strong>{invoice.invoiceNo}</strong>
                  </td>
                  <td>{invoice.date}</td>
                  <td>{invoice.customer?.name || "Unknown Customer"}</td>
                  <td style={{ textTransform: "capitalize" }}>
                    {invoice.paymentType}
                  </td>
                  <td>{formatCurrency(invoice.grandTotal)}</td>
                  <td>
                    {isPaid ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.65rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                        }}
                      >
                        Paid
                      </span>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.35rem",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            width: "fit-content",
                          }}
                        >
                          Credit: {formatCurrency(outstanding)}
                        </span>
                        <button
                          onClick={() => openPayModal(invoice)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            width: "fit-content",
                            padding: "0.25rem 0.6rem",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            color: "#ffffff",
                            backgroundColor: "#2563eb",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                          title="Make Payment"
                        >
                          <CreditCard size={13} /> Pay
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn-icon text-blue"
                        onClick={() => openViewModal(invoice)}
                        title="View Invoice"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="btn-icon text-blue"
                        onClick={() =>
                          navigate(`/invoices/edit/${invoice._id}`)
                        }
                        title="Edit Invoice"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(invoice._id)}
                        style={{ color: "#ef4444" }}
                        title="Delete Invoice"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {currentInvoices.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  {invoices.length === 0
                    ? "No invoices found. Generate your first invoice!"
                    : "No invoices match your filter or search criteria."}
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
            {Math.min(indexOfLastItem, filteredInvoices.length)} of{" "}
            {filteredInvoices.length} entries
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

      {/* MAKE PAYMENT MODAL */}
      {isPayModalOpen &&
        payingInvoice &&
        (() => {
          const { grandTotal, paidAmount, outstanding } =
            getPaymentDetails(payingInvoice);
          const enteredAmount = Number(payingAmount || 0);
          const remainingCredit = Math.max(0, outstanding - enteredAmount);

          return (
            <div className="modal-overlay">
              <div
                className="modal-content"
                style={{ maxWidth: "460px", width: "95%" }}
              >
                <div className="modal-header">
                  <h2>Settle Credit: {payingInvoice.invoiceNo}</h2>
                  <button className="btn-icon" onClick={closePayModal}>
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  {/* Payment Method Tabs */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                      }}
                    >
                      Select Payment Method
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "0.5rem",
                        background: "#f3f4f6",
                        padding: "0.35rem",
                        borderRadius: "8px",
                      }}
                    >
                      {["cash", "online", "cheque"].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          style={{
                            padding: "0.5rem",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "600",
                            textTransform: "capitalize",
                            backgroundColor:
                              paymentMethod === method
                                ? "#2563eb"
                                : "transparent",
                            color:
                              paymentMethod === method ? "#ffffff" : "#374151",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      marginBottom: "1.25rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.4rem",
                      }}
                    >
                      <span>Invoice Grand Total:</span>
                      <strong>{formatCurrency(grandTotal)}</strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.4rem",
                        color: "#166534",
                      }}
                    >
                      <span>Already Paid:</span>
                      <strong>{formatCurrency(paidAmount)}</strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: "0.4rem",
                        color: "#991b1b",
                      }}
                    >
                      <span>Current Credit Balance:</span>
                      <strong>{formatCurrency(outstanding)}</strong>
                    </div>
                  </div>

                  {/* Paying Amount Input */}
                  <div
                    className="form-group"
                    style={{ marginBottom: "1.25rem" }}
                  >
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.4rem",
                        fontWeight: "600",
                      }}
                    >
                      Paying Amount (Rs.) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={outstanding}
                      value={payingAmount}
                      onChange={(e) => setPayingAmount(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.6rem",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        fontSize: "1rem",
                        color: "#ffffff",
                        boxSizing: "border-box",
                      }}
                      required
                    />
                  </div>

                  {/* Remaining Credit After Payment */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.85rem 1rem",
                      borderRadius: "8px",
                      backgroundColor:
                        remainingCredit > 0.01 ? "#fef2f2" : "#f0fdf4",
                      border: `1px solid ${
                        remainingCredit > 0.01 ? "#fecaca" : "#bbf7d0"
                      }`,
                      marginBottom: "1.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "600",
                        color: remainingCredit > 0.01 ? "#991b1b" : "#166534",
                      }}
                    >
                      {remainingCredit > 0.01
                        ? "Remaining Credit:"
                        : "Status After Payment:"}
                    </span>
                    <strong
                      style={{
                        fontSize: "1.05rem",
                        color: remainingCredit > 0.01 ? "#dc2626" : "#15803d",
                      }}
                    >
                      {remainingCredit > 0.01
                        ? formatCurrency(remainingCredit)
                        : "Fully Paid"}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "0.75rem",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closePayModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Confirm Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

      {/* VIEW MODAL */}
      {isModalOpen && selectedInvoice && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{
              maxWidth: "850px",
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className="modal-header">
              <h2>Invoice Details: {selectedInvoice.invoiceNo}</h2>
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
              }}
            >
              <div>
                <p>
                  <strong>Date:</strong> {selectedInvoice.date}{" "}
                  {selectedInvoice.time}
                </p>
                <p>
                  <strong>Customer:</strong> {selectedInvoice.customer?.name}
                </p>
                <p>
                  <strong>Payment:</strong>{" "}
                  <span style={{ textTransform: "capitalize" }}>
                    {selectedInvoice.paymentType}
                  </span>
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p>
                  <strong>Quotation No:</strong>{" "}
                  {selectedInvoice.quotationNo || "-"}
                </p>
                <p>
                  <strong>Purchasing No:</strong>{" "}
                  {selectedInvoice.purchasingNo || "-"}
                </p>
              </div>
            </div>

            <div className="table-container" style={{ marginBottom: "1.5rem" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px", textAlign: "center" }}>#</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Rate</th>
                    <th>Disc (%)</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unitType}</td>
                      <td>{formatCurrency(item.rate)}</td>
                      <td>{item.discountPercentage}%</td>
                      <td>{formatCurrency(item.itemTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* REMARKS DISPLAY */}
            {selectedInvoice.remarks && (
              <div
                style={{
                  marginBottom: "1.5rem",
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
                  {selectedInvoice.remarks}
                </p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  width: "340px",
                  background: "#f9fafb",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Bill Total:</span>{" "}
                  <span>{formatCurrency(selectedInvoice.billTotal)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Bill Discount ({selectedInvoice.billDiscount}%):</span>{" "}
                  <span>
                    -{" "}
                    {formatCurrency(
                      selectedInvoice.billTotal *
                        (selectedInvoice.billDiscount / 100),
                    )}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>
                    VAT ({selectedInvoice.isVatApplied ? "Applied" : "None"}):
                  </span>{" "}
                  <span>{formatCurrency(selectedInvoice.vatAmount)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                    borderBottom: "1px solid #d1d5db",
                    paddingBottom: "1rem",
                  }}
                >
                  <span>Advance Deduction:</span>{" "}
                  <span>
                    - {formatCurrency(selectedInvoice.advancePaymentDeduction)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                  }}
                >
                  <span>Grand Total:</span>{" "}
                  <span>{formatCurrency(selectedInvoice.grandTotal)}</span>
                </div>
                {(() => {
                  const { paidAmount, outstanding, isPaid } =
                    getPaymentDetails(selectedInvoice);
                  return (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        paddingTop: "0.75rem",
                        borderTop: "1px dashed #d1d5db",
                        fontSize: "0.9rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.25rem",
                          color: "#166534",
                        }}
                      >
                        <span>Paid Amount:</span>
                        <strong>{formatCurrency(paidAmount)}</strong>
                      </div>
                      {!isPaid && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: "#991b1b",
                          }}
                        >
                          <span>Credit Balance:</span>
                          <strong>{formatCurrency(outstanding)}</strong>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT COMPONENT */}
      <div className="print-source-hidden">
        <InvoicePrintTemplate
          ref={printRef}
          invoice={selectedInvoice}
          settings={settings}
        />
      </div>
    </div>
  );
};

export default InvoiceList;
