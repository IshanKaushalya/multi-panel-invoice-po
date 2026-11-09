import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Filter,
  Printer,
  FileSpreadsheet,
  FileText,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";
import { ReportPrintTemplate } from "../components/ReportPrintTemplate";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Reports = () => {
  // Filter States
  const [reportType, setReportType] = useState("invoices"); // 'invoices' or 'pos'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [productType, setProductType] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all"); // 'all' | 'paid' | 'credit'

  // Data States
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({
    count: 0,
    subTotal: 0,
    vat: 0,
    grandTotal: 0,
  });

  const printRef = useRef();

  // Fetch dropdown data on load
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [custRes, suppRes] = await Promise.all([
          axios.get(`${API_URL}/api/customers`),
          axios.get(`${API_URL}/api/suppliers`),
        ]);
        setCustomers(custRes.data);
        setSuppliers(suppRes.data);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };
    fetchMetadata();
  }, []);

  // Reset conditional filters when changing report type
  useEffect(() => {
    setCustomerId("");
    setSupplierId("");
    setProductType("");
    setPaymentStatusFilter("all");
    setReportData([]);
    setSummary({ count: 0, subTotal: 0, vat: 0, grandTotal: 0 });
  }, [reportType]);

  const getPaymentDetails = (item) => {
    const grandTotal = Number(item.grandTotal || 0);
    let paidAmount = grandTotal;

    if (item.paidAmount !== undefined) {
      paidAmount = Number(item.paidAmount);
    } else if (item.paymentType === "credit") {
      paidAmount = 0;
    }

    const outstanding = Math.max(0, grandTotal - paidAmount);
    const isPaid = outstanding <= 0.01;

    return { isPaid };
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();

    try {
      const endpoint =
        reportType === "invoices" ? "/api/invoices" : "/api/purchase-orders";
      const response = await axios.get(`${API_URL}${endpoint}`);
      let data = response.data;

      // Apply Date Filters
      if (startDate) {
        data = data.filter(
          (item) => new Date(item.date) >= new Date(startDate),
        );
      }
      if (endDate) {
        data = data.filter((item) => new Date(item.date) <= new Date(endDate));
      }

      // Apply Customer/Supplier/Product Filters
      if (reportType === "invoices" && customerId) {
        data = data.filter((item) => item.customer?._id === customerId);
      }
      if (reportType === "pos") {
        if (supplierId)
          data = data.filter((item) => item.supplier?._id === supplierId);
        if (productType)
          data = data.filter((item) => item.productType === productType);
      }

      // Apply Paid / Credit Status Filter
      if (paymentStatusFilter !== "all") {
        data = data.filter((item) => {
          const { isPaid } = getPaymentDetails(item);
          return paymentStatusFilter === "paid" ? isPaid : !isPaid;
        });
      }

      setReportData(data);

      // Calculate Summary Totals
      const calculatedSummary = data.reduce(
        (acc, curr) => {
          const discountAmount =
            curr.billTotal * (Number(curr.billDiscount || 0) / 100);
          const subTotalAfterDiscount = curr.billTotal - discountAmount;

          acc.count += 1;
          acc.subTotal += subTotalAfterDiscount;
          acc.vat += curr.vatAmount;
          acc.grandTotal += curr.grandTotal;
          return acc;
        },
        { count: 0, subTotal: 0, vat: 0, grandTotal: 0 },
      );

      setSummary(calculatedSummary);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report.");
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${reportType === "invoices" ? "Sales_Report" : "Expense_Report"}`,
  });

  // Export to Excel handler
  const handleExportExcel = () => {
    if (reportData.length === 0) return;

    // Format rows for excel export
    const excelRows = reportData.map((row) => {
      const { isPaid } = getPaymentDetails(row);
      const subTotal =
        row.billTotal - row.billTotal * (Number(row.billDiscount || 0) / 100);

      const baseRow = {
        Date: row.date,
        [reportType === "invoices" ? "Invoice No." : "PO No."]:
          reportType === "invoices" ? row.invoiceNo : row.poNo,
        [reportType === "invoices" ? "Customer" : "Supplier"]:
          reportType === "invoices" ? row.customer?.name : row.supplier?.name,
      };

      if (reportType === "pos") {
        baseRow["Product Type"] = row.productType;
      }

      return {
        ...baseRow,
        "Payment Type": row.paymentType,
        Status: isPaid ? "Paid" : "Credit",
        Subtotal: Number(subTotal.toFixed(2)),
        VAT: Number(row.vatAmount.toFixed(2)),
        "Grand Total": Number(row.grandTotal.toFixed(2)),
      };
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      reportType === "invoices" ? "Sales Report" : "Expense Report",
    );

    // Trigger file download
    const fileName = `${reportType === "invoices" ? "Sales_Report" : "Expense_Report"}_${
      startDate || "All"
    }_to_${endDate || "Today"}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="page-container">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Reports & Analytics</h1>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className="btn btn-secondary"
            onClick={handleExportExcel}
            disabled={reportData.length === 0}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <FileSpreadsheet size={18} /> Export Excel
          </button>
          <button
            className="btn btn-secondary"
            onClick={handlePrint}
            disabled={reportData.length === 0}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Printer size={18} /> Print Report
          </button>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div
        style={{
          background: "#f9fafb",
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <Filter size={20} color="#4b5563" />
          <h3 style={{ margin: 0 }}>Report Parameters</h3>
        </div>

        <form onSubmit={handleGenerateReport} className="form-grid">
          <div className="form-group">
            <label>Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            >
              <option value="invoices">Sales Report (Invoices)</option>
              <option value="pos">Expense Report (Purchase Orders)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Payment Status Filter */}
          <div className="form-group">
            <label>Payment Status</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="credit">Credit / Unpaid</option>
            </select>
          </div>

          {reportType === "invoices" && (
            <div className="form-group">
              <label>Filter by Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                style={{
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                }}
              >
                <option value="">All Customers</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === "pos" && (
            <>
              <div className="form-group">
                <label>Filter by Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                  }}
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Filter by Product Type</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                  }}
                >
                  <option value="">All Types</option>
                  <option value="powder coat">Powder Coat</option>
                  <option value="metal">Metal</option>
                  <option value="electrical">Electrical</option>
                  <option value="wood">Wood</option>
                  <option value="glass">Glass</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          <div
            className="form-actions full-width"
            style={{ justifyContent: "flex-start", marginTop: "1rem" }}
          >
            <button type="submit" className="btn btn-primary">
              Generate Report
            </button>
          </div>
        </form>
      </div>

      {/* SUMMARY CARDS */}
      {reportData.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              borderLeft: "4px solid #3b82f6",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  color: "#6b7280",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                }}
              >
                Total Records
              </span>
              {reportType === "invoices" ? (
                <FileText size={20} color="#3b82f6" />
              ) : (
                <ShoppingCart size={20} color="#3b82f6" />
              )}
            </div>
            <h2 style={{ margin: 0, fontSize: "1.8rem" }}>{summary.count}</h2>
          </div>

          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              borderLeft: "4px solid #10b981",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  color: "#6b7280",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                }}
              >
                Subtotal (After Discount)
              </span>
              <DollarSign size={20} color="#10b981" />
            </div>
            <h2 style={{ margin: 0, fontSize: "1.8rem" }}>
              {summary.subTotal.toFixed(2)}
            </h2>
          </div>

          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              borderLeft: "4px solid #f59e0b",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  color: "#6b7280",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                }}
              >
                Total VAT Collected
              </span>
              <DollarSign size={20} color="#f59e0b" />
            </div>
            <h2 style={{ margin: 0, fontSize: "1.8rem" }}>
              {summary.vat.toFixed(2)}
            </h2>
          </div>

          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              borderLeft: "4px solid #8b5cf6",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  color: "#6b7280",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                }}
              >
                Grand Total
              </span>
              <DollarSign size={20} color="#8b5cf6" />
            </div>
            <h2 style={{ margin: 0, fontSize: "1.8rem" }}>
              {summary.grandTotal.toFixed(2)}
            </h2>
          </div>
        </div>
      )}

      {/* REPORT DATA TABLE */}
      {reportData.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>{reportType === "invoices" ? "Invoice No." : "PO No."}</th>
                <th>{reportType === "invoices" ? "Customer" : "Supplier"}</th>
                {reportType === "pos" && <th>Product Type</th>}
                <th>Payment Type</th>
                <th>Status</th>
                <th>Subtotal</th>
                <th>VAT</th>
                <th>Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => {
                const { isPaid } = getPaymentDetails(row);
                return (
                  <tr key={row._id}>
                    <td>{row.date}</td>
                    <td>
                      <strong>
                        {reportType === "invoices" ? row.invoiceNo : row.poNo}
                      </strong>
                    </td>
                    <td>
                      {reportType === "invoices"
                        ? row.customer?.name
                        : row.supplier?.name}
                    </td>
                    {reportType === "pos" && (
                      <td style={{ textTransform: "capitalize" }}>
                        {row.productType}
                      </td>
                    )}
                    <td style={{ textTransform: "capitalize" }}>
                      {row.paymentType}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          backgroundColor: isPaid ? "#dcfce7" : "#fee2e2",
                          color: isPaid ? "#166534" : "#991b1b",
                        }}
                      >
                        {isPaid ? "Paid" : "Credit"}
                      </span>
                    </td>
                    <td>
                      {(
                        row.billTotal -
                        row.billTotal * (Number(row.billDiscount || 0) / 100)
                      ).toFixed(2)}
                    </td>
                    <td>{row.vatAmount.toFixed(2)}</td>
                    <td style={{ fontWeight: "bold" }}>
                      {row.grandTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {reportData.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          Select your parameters and click "Generate Report" to view analytics.
        </div>
      )}

      {/* HIDDEN PRINT COMPONENT */}
      <div className="print-source-hidden">
        <ReportPrintTemplate
          ref={printRef}
          reportType={reportType}
          startDate={startDate}
          endDate={endDate}
          reportData={reportData}
          summary={summary}
        />
      </div>
    </div>
  );
};

export default Reports;
