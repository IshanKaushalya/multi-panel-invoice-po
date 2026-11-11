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

  // Direct print handler configured with 0 page margins to eliminate whitespace
  const handleDirectPrint = () => {
    if (ref && ref.current) {
      const printContents = ref.current.innerHTML;
      const originalContents = document.body.innerHTML;

      document.body.innerHTML = `
        <html>
          <head>
            <title></title>
            <style>
              @page {
                size: 21.5cm 28cm;
                margin: 5mm; /* Minimal physical paper margin */
              }
              body { 
                font-family: Arial, sans-serif; 
                color: #000; 
                margin: 0; 
                padding: 0; 
                width: 20.5cm;
                box-sizing: border-box;
              }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th, td { border: 1.5px solid #000; padding: 6px 8px; font-size: 11px; }
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
          width: "100%",
          maxWidth: "20.5cm",
          margin: "0 auto",
          padding: "5mm",
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
              paddingBottom: "15px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <img
                src="/logo.png"
                alt="Company Logo"
                style={{ width: "70px", height: "70px", objectFit: "contain" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div>
                <h1
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "18px",
                    color: "#111827",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayCompanyName}
                </h1>
                <p style={{ margin: "2px 0", fontSize: "12px" }}>
                  {settings?.companyAddress ||
                    "No.466/7A Thapowanaya Road, Aggona, Angoda"}
                </p>
                <p style={{ margin: "2px 0", fontSize: "12px" }}>
                  Phone: {settings?.companyPhone || "0777791772/0771118034"}
                </p>
                <p style={{ margin: "2px 0", fontSize: "12px" }}>
                  Email:{" "}
                  {settings?.companyEmail || "newmultiengineering@gmail.com"}
                </p>
              </div>
            </div>

            <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "26px",
                  color: "#374151",
                  textTransform: "uppercase",
                }}
              >
                Invoice
              </h2>
              <p
                style={{
                  margin: "4px 0",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                Invoice No: {invoice.invoiceNo}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px" }}>
                Date: {invoice.date}
              </p>
            </div>
          </div>

          {/* META DATA */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "25px",
              fontSize: "13px",
            }}
          >
            <div style={{ width: "48%" }}>
              <h3
                style={{
                  borderBottom: "1px solid #000",
                  paddingBottom: "4px",
                  marginBottom: "8px",
                  fontSize: "14px",
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
            <div style={{ width: "48%" }}>
              <h3
                style={{
                  borderBottom: "1px solid #000",
                  paddingBottom: "4px",
                  marginBottom: "8px",
                  fontSize: "14px",
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
          <table
            className="print-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    width: "35px",
                    textAlign: "center",
                    border: "1.5px solid #000",
                    padding: "6px",
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    border: "1.5px solid #000",
                    padding: "6px",
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Description
                </th>
                <th
                  style={{
                    width: "50px",
                    textAlign: "center",
                    border: "1.5px solid #000",
                    padding: "6px",
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Qty
                </th>
                <th
                  style={{
                    width: "65px",
                    textAlign: "center",
                    border: "1.5px solid #000",
                    padding: "6px",
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Unit
                </th>
                <th
                  style={{
                    width: "100px",
                    textAlign: "right",
                    border: "1.5px solid #000",
                    padding: "6px",
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Rate (Rs.)
                </th>
                <th
                  style={{
                    width: "65px",
                    textAlign: "right",
                    border: "1.5px solid #000",
                    padding: "6px",
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Disc (%)
                </th>
                <th
                  style={{
                    width: "110px",
                    textAlign: "right",
                    border: "1.5px solid #000",
                    padding: "6px",
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Total (Rs.)
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td
                    style={{
                      textAlign: "center",
                      border: "1.5px solid #000",
                      padding: "6px",
                      fontSize: "11px",
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      border: "1.5px solid #000",
                      padding: "6px",
                      fontSize: "11px",
                    }}
                  >
                    {item.description}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      border: "1.5px solid #000",
                      padding: "6px",
                      fontSize: "11px",
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      border: "1.5px solid #000",
                      padding: "6px",
                      fontSize: "11px",
                    }}
                  >
                    {item.unitType}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      border: "1.5px solid #000",
                      padding: "6px",
                      fontSize: "11px",
                    }}
                  >
                    {formatCurrency(item.rate)}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      border: "1.5px solid #000",
                      padding: "6px",
                      fontSize: "11px",
                    }}
                  >
                    {item.discountPercentage}%
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      border: "1.5px solid #000",
                      padding: "6px",
                      fontSize: "11px",
                    }}
                  >
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
                  minHeight: "70px",
                  border: "1.5px solid #000",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                <strong>Remarks:</strong>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "12px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {invoice.remarks && invoice.remarks.trim() !== ""
                    ? invoice.remarks
                    : "-"}
                </p>
              </div>
            </div>

            <div style={{ width: "300px", fontSize: "13px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.billTotal)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
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
                  marginBottom: "6px",
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
                  marginBottom: "6px",
                  borderBottom: "1.5px solid #000",
                  paddingBottom: "6px",
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
                  fontSize: "16px",
                  marginTop: "6px",
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
            paddingTop: "30px",
            textAlign: "center",
            color: "#4b5563",
            fontSize: "13px",
          }}
        >
          <p style={{ marginBottom: "35px" }}>Thank you for your business!</p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 10px",
            }}
          >
            <div
              style={{
                borderTop: "1.5px solid #000",
                width: "200px",
                paddingTop: "8px",
                color: "#000",
                fontSize: "12px",
              }}
            >
              Customer Signature
            </div>
            <div
              style={{
                borderTop: "1.5px solid #000",
                width: "200px",
                paddingTop: "8px",
                color: "#000",
                fontSize: "12px",
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
