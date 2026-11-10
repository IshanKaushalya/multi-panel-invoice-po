import React from "react";

const formatCurrency = (amount) => {
  return `Rs. ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const InvoicePrintTemplate = React.forwardRef(({ invoice, settings }, ref) => {
  if (!invoice) return <div ref={ref} style={{ display: "none" }}></div>;

  const displayCompanyName =
    settings?.companyName && settings.companyName.trim() !== "My Company"
      ? settings.companyName
      : "Multi Engineering Services Lanka (Pvt) Ltd";

  // Direct print handler that bypasses desktop saving
  const handleDirectPrint = () => {
    if (ref && ref.current) {
      const printContents = ref.current.innerHTML;
      const originalContents = document.body.innerHTML;

      // Temporarily replace body content with only the invoice template content for printing
      document.body.innerHTML = `
        <html>
          <head>
            <title>Invoice - ${invoice.invoiceNo || ""}</title>
            <style>
              body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #000; padding: 8px; font-size: 12px; }
              th { background-color: #f3f4f6; }
              .no-print { display: none !important; }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `;

      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Restores full React application state seamlessly
    } else {
      window.print();
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* DIRECT PRINT BUTTON (Hidden automatically during printing) */}
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "15px",
        }}
      >
        <button
          onClick={handleDirectPrint}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "0.6rem 1.2rem",
            borderRadius: "6px",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          🖨️ Print Directly
        </button>
      </div>

      {/* INVOICE CONTAINER */}
      <div
        ref={ref}
        style={{
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          color: "#000",
          minHeight: "260mm",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundColor: "#fff",
        }}
      >
        {/* TOP CONTENT WRAPPER */}
        <div style={{ flex: 1 }}>
          {/* HEADER WITH LOGO */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "2px solid #000",
              paddingBottom: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                maxWidth: "68%",
              }}
            >
              <img
                src="/logo.png"
                alt="Company Logo"
                style={{ width: "75px", height: "75px", objectFit: "contain" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div>
                <h1
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "20px",
                    color: "#111827",
                  }}
                >
                  {displayCompanyName}
                </h1>
                <p style={{ margin: "2px 0", fontSize: "13px" }}>
                  {settings?.companyAddress ||
                    "No.466/7A Thapowanaya Road, Aggona, Angoda"}
                </p>
                <p style={{ margin: "2px 0", fontSize: "13px" }}>
                  Phone: {settings?.companyPhone || "0777791772/0771118034"}
                </p>
                <p style={{ margin: "2px 0", fontSize: "13px" }}>
                  Email:{" "}
                  {settings?.companyEmail || "newmultiengineering@gmail.com"}
                </p>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <h2
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "32px",
                  color: "#374151",
                  textTransform: "uppercase",
                }}
              >
                Invoice
              </h2>
              <p style={{ margin: "5px 0", fontWeight: "bold" }}>
                Invoice No: {invoice.invoiceNo}
              </p>
              <p style={{ margin: "5px 0" }}>Date: {invoice.date}</p>
            </div>
          </div>

          {/* META DATA */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "30px",
            }}
          >
            <div style={{ width: "45%" }}>
              <h3
                style={{
                  borderBottom: "1px solid #000",
                  paddingBottom: "5px",
                  marginBottom: "10px",
                }}
              >
                Bill To:
              </h3>
              <p style={{ margin: "2px 0", fontWeight: "bold" }}>
                {invoice.customer?.name}
              </p>
              <p style={{ margin: "2px 0" }}>
                Phone: {invoice.customer?.telephone}
              </p>
              <p style={{ margin: "2px 0" }}>
                Address: {invoice.customer?.address}
              </p>
            </div>
            <div style={{ width: "45%" }}>
              <h3
                style={{
                  borderBottom: "1px solid #000",
                  paddingBottom: "5px",
                  marginBottom: "10px",
                }}
              >
                Details:
              </h3>
              <p style={{ margin: "2px 0" }}>
                Payment Type:{" "}
                <span style={{ textTransform: "capitalize" }}>
                  {invoice.paymentType}
                </span>
              </p>
              <p style={{ margin: "2px 0" }}>
                Quotation No: {invoice.quotationNo || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                Purchasing No: {invoice.purchasingNo || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                Advance No: {invoice.advanceNo || "N/A"}
              </p>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: "40px", textAlign: "center" }}>#</th>
                <th>Description</th>
                <th style={{ textAlign: "center" }}>Qty</th>
                <th style={{ textAlign: "center" }}>Unit</th>
                <th style={{ textAlign: "right" }}>Rate (Rs.)</th>
                <th style={{ textAlign: "right" }}>Disc (%)</th>
                <th style={{ textAlign: "right" }}>Total (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{item.description}</td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ textAlign: "center" }}>{item.unitType}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(item.rate)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {item.discountPercentage}%
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(item.itemTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* REMARKS & TOTALS SECTION */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: "20px",
            }}
          >
            <div style={{ width: "48%" }}>
              <div
                style={{
                  padding: "10px",
                  minHeight: "80px",
                  border: "1px solid #000",
                  borderRadius: "4px",
                }}
              >
                <strong>Remarks:</strong>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "14px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {invoice.remarks && invoice.remarks.trim() !== ""
                    ? invoice.remarks
                    : "-"}
                </p>
              </div>
            </div>

            <div style={{ width: "320px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.billTotal)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Discount ({invoice.billDiscount}%):</span>
                <span>
                  -{" "}
                  {formatCurrency(
                    invoice.billTotal * (invoice.billDiscount / 100),
                  )}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>
                  VAT (
                  {invoice.isVatApplied ? `${settings?.vatRate || 18}%` : "0%"}
                  ):
                </span>
                <span>{formatCurrency(invoice.vatAmount)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  borderBottom: "1px solid #000",
                  paddingBottom: "8px",
                }}
              >
                <span>Advance Deduction:</span>
                <span>{formatCurrency(invoice.advancePaymentDeduction)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  fontSize: "18px",
                  marginTop: "8px",
                }}
              >
                <span>Grand Total:</span>
                <span>{formatCurrency(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "40px",
            textAlign: "center",
            color: "#4b5563",
            fontSize: "14px",
          }}
        >
          <p style={{ marginBottom: "40px" }}>Thank you for your business!</p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 20px",
            }}
          >
            <div
              style={{
                borderTop: "1px solid #000",
                width: "220px",
                paddingTop: "10px",
                color: "#000",
              }}
            >
              Customer Signature
            </div>
            <div
              style={{
                borderTop: "1px solid #000",
                width: "220px",
                paddingTop: "10px",
                color: "#000",
              }}
            >
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InvoicePrintTemplate;
