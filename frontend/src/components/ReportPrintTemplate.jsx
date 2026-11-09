import React from "react";

const formatCurrency = (amount) => {
  return `Rs. ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const ReportPrintTemplate = React.forwardRef(
  ({ reportType, startDate, endDate, reportData, summary }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          padding: "2rem",
          background: "white",
          color: "#000",
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: "0 0 5px 0", fontSize: "20px" }}>
            {reportType === "invoices"
              ? "Sales Report (Invoices)"
              : "Expense Report (Purchase Orders)"}
          </h2>
          <p style={{ margin: 0, color: "#555" }}>
            Period: {startDate || "Beginning"} to {endDate || "Today"}
          </p>
        </div>

        {/* Summary Box */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "#f9f9f9",
          }}
        >
          <div>
            <strong>Total Records:</strong> {summary.count}
          </div>
          <div>
            <strong>Subtotal:</strong> {formatCurrency(summary.subTotal)}
          </div>
          <div>
            <strong>Total VAT:</strong> {formatCurrency(summary.vat)}
          </div>
          <div>
            <strong>Grand Total:</strong> {formatCurrency(summary.grandTotal)}
          </div>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "1rem",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #000", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Date</th>
              <th style={{ padding: "8px" }}>
                {reportType === "invoices" ? "Invoice No." : "PO No."}
              </th>
              <th style={{ padding: "8px" }}>
                {reportType === "invoices" ? "Customer" : "Supplier"}
              </th>
              {reportType === "pos" && (
                <th style={{ padding: "8px" }}>Product Type</th>
              )}
              <th style={{ padding: "8px" }}>Payment</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Subtotal</th>
              <th style={{ padding: "8px", textAlign: "right" }}>VAT</th>
              <th style={{ padding: "8px", textAlign: "right" }}>
                Grand Total
              </th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row) => {
              const subTotal =
                row.billTotal -
                row.billTotal * (Number(row.billDiscount || 0) / 100);
              return (
                <tr key={row._id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "8px" }}>{row.date}</td>
                  <td style={{ padding: "8px" }}>
                    <strong>
                      {reportType === "invoices" ? row.invoiceNo : row.poNo}
                    </strong>
                  </td>
                  <td style={{ padding: "8px" }}>
                    {reportType === "invoices"
                      ? row.customer?.name
                      : row.supplier?.name}
                  </td>
                  {reportType === "pos" && (
                    <td style={{ padding: "8px", textTransform: "capitalize" }}>
                      {row.productType}
                    </td>
                  )}
                  <td style={{ padding: "8px", textTransform: "capitalize" }}>
                    {row.paymentType}
                  </td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    {formatCurrency(subTotal)}
                  </td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    {formatCurrency(row.vatAmount)}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    {formatCurrency(row.grandTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  },
);

ReportPrintTemplate.displayName = "ReportPrintTemplate";
