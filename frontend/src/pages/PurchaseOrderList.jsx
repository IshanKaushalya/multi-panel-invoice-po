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
import PurchaseOrderPrintTemplate from "../components/PurchaseOrderPrintTemplate";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const formatCurrency = (amount) => {
  return `Rs. ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const PurchaseOrderList = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedPO, setSelectedPO] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "paid" | "unpaid"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Payment Modal States
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingPO, setPayingPO] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [payingAmount, setPayingAmount] = useState("");

  const navigate = useNavigate();
  const printRef = useRef();

  useEffect(() => {
    fetchPurchaseOrders();
    fetchSettings();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/purchase-orders`);
      setPurchaseOrders(response.data);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
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

  const getPaymentDetails = (po) => {
    const grandTotal = Number(po.grandTotal || 0);
    let paidAmount = grandTotal;

    if (po.paidAmount !== undefined) {
      paidAmount = Number(po.paidAmount);
    } else if (po.paymentType === "credit") {
      paidAmount = 0;
    }

    const outstanding = Math.max(0, grandTotal - paidAmount);
    const isPaid = outstanding <= 0.01;

    return { grandTotal, paidAmount, outstanding, isPaid };
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this purchase order? This action cannot be undone.",
      )
    ) {
      try {
        await axios.delete(`${API_URL}/api/purchase-orders/${id}`);
        fetchPurchaseOrders();
      } catch (error) {
        console.error("Error deleting PO:", error);
        alert("Failed to delete purchase order.");
      }
    }
  };

  const openViewModal = (po) => {
    setSelectedPO(po);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPO(null);
  };

  const openPayModal = (po) => {
    const { outstanding } = getPaymentDetails(po);
    setPayingPO(po);
    setPaymentMethod("cash");
    setPayingAmount(outstanding.toFixed(2));
    setIsPayModalOpen(true);
  };

  const closePayModal = () => {
    setIsPayModalOpen(false);
    setPayingPO(null);
    setPayingAmount("");
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payingPO) return;

    const { outstanding } = getPaymentDetails(payingPO);
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
      await axios.post(`${API_URL}/api/purchase-orders/${payingPO._id}/pay`, {
        amount: amountNum,
        method: paymentMethod,
      });
      closePayModal();
      fetchPurchaseOrders();
    } catch (error) {
      console.error("Error recording PO payment:", error);
      alert(error.response?.data?.message || "Failed to record payment.");
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedPO ? `${selectedPO.poNo}` : "Purchase_Order",
  });

  const paidCount = purchaseOrders.filter(
    (po) => getPaymentDetails(po).isPaid,
  ).length;
  const unpaidCount = purchaseOrders.length - paidCount;

  // Filter purchase orders by Search Term and Status
  const filteredPOs = purchaseOrders.filter((po) => {
    const query = searchTerm.toLowerCase();
    const poNoMatch = po.poNo?.toLowerCase().includes(query);
    const supplierNameMatch = po.supplier?.name?.toLowerCase().includes(query);
    const matchesSearch = poNoMatch || supplierNameMatch;

    const { isPaid } = getPaymentDetails(po);
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "paid"
          ? isPaid
          : !isPaid;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPOs = filteredPOs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage) || 1;

  return (
    <div
      className="page-container"
      style={{ width: "100%", boxSizing: "border-box" }}
    >
      <div className="page-header">
        <h1>Purchase Order Management</h1>
        <Link
          to="/pos/new"
          className="btn btn-primary"
          style={{ textDecoration: "none" }}
        >
          <Plus size={18} /> Create Purchase Order
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
              placeholder="Search by PO No. or Supplier Name..."
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
            { id: "all", label: `All (${purchaseOrders.length})` },
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
              <th>PO No.</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Payment Type</th>
              <th>Grand Total</th>
              <th>Status / Credit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPOs.map((po) => {
              const { outstanding, isPaid } = getPaymentDetails(po);

              return (
                <tr key={po._id}>
                  <td>
                    <strong>{po.poNo}</strong>
                  </td>
                  <td>{po.date}</td>
                  <td>{po.supplier?.name || "Unknown Supplier"}</td>
                  <td style={{ textTransform: "capitalize" }}>
                    {po.paymentType}
                  </td>
                  <td>{formatCurrency(po.grandTotal)}</td>
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
                          onClick={() => openPayModal(po)}
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
                        onClick={() => openViewModal(po)}
                        title="View Purchase Order"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="btn-icon text-blue"
                        onClick={() => navigate(`/pos/edit/${po._id}`)}
                        title="Edit Purchase Order"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(po._id)}
                        style={{ color: "#ef4444" }}
                        title="Delete Purchase Order"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {currentPOs.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  {purchaseOrders.length === 0
                    ? "No purchase orders found. Create your first PO!"
                    : "No purchase orders match your filter or search criteria."}
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
            {Math.min(indexOfLastItem, filteredPOs.length)} of{" "}
            {filteredPOs.length} entries
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
        payingPO &&
        (() => {
          const { grandTotal, paidAmount, outstanding } =
            getPaymentDetails(payingPO);
          const enteredAmount = Number(payingAmount || 0);
          const remainingCredit = Math.max(0, outstanding - enteredAmount);

          return (
            <div className="modal-overlay">
              <div
                className="modal-content"
                style={{ maxWidth: "460px", width: "95%" }}
              >
                <div className="modal-header">
                  <h2>Settle PO Credit: {payingPO.poNo}</h2>
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
                      <span>PO Grand Total:</span>
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
      {isModalOpen && selectedPO && (
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
              <h2>Purchase Order Details: {selectedPO.poNo}</h2>
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
                  <strong>Date:</strong> {selectedPO.date} {selectedPO.time}
                </p>
                <p>
                  <strong>Supplier:</strong> {selectedPO.supplier?.name}
                </p>
                <p>
                  <strong>Payment:</strong>{" "}
                  <span style={{ textTransform: "capitalize" }}>
                    {selectedPO.paymentType}
                  </span>
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p>
                  <strong>Product Type:</strong>{" "}
                  <span style={{ textTransform: "capitalize" }}>
                    {selectedPO.productType}
                  </span>
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
                  {selectedPO.items.map((item, index) => (
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
            {selectedPO.remarks && (
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
                  {selectedPO.remarks}
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
                  <span>{formatCurrency(selectedPO.billTotal)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Bill Discount ({selectedPO.billDiscount}%):</span>{" "}
                  <span>
                    -{" "}
                    {formatCurrency(
                      selectedPO.billTotal * (selectedPO.billDiscount / 100),
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
                    VAT ({selectedPO.isVatApplied ? "Applied" : "None"}):
                  </span>{" "}
                  <span>{formatCurrency(selectedPO.vatAmount)}</span>
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
                    - {formatCurrency(selectedPO.advancePaymentDeduction)}
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
                  <span>{formatCurrency(selectedPO.grandTotal)}</span>
                </div>
                {(() => {
                  const { paidAmount, outstanding, isPaid } =
                    getPaymentDetails(selectedPO);
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
        <PurchaseOrderPrintTemplate
          ref={printRef}
          po={selectedPO}
          settings={settings}
        />
      </div>
    </div>
  );
};

export default PurchaseOrderList;
