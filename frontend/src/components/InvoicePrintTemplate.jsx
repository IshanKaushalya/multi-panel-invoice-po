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

  const generatedTime = new Date().toLocaleString("en-US", {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      ref={ref}
      className="print-root"
      style={{
        width: "100%",
        minHeight: "268mm",
        margin: "0",
        padding: "0",
        fontFamily: "Arial, sans-serif",
        color: "#000",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        backgroundColor: "#fff",
      }}
    >
      <style>
        {`
          @media print {
            @page {
              size: 21.5cm 28cm;
              margin: 5mm !important;
            }
            body {
              width: 21.5cm !important;
              height: 28cm !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      {/* TOP METADATA BAR: Generated Time & Invoice Number */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "11px",
          color: "#000",
          marginBottom: "12px",
        }}
      >
        <span>{generatedTime}</span>
        <span style={{ fontWeight: "500" }}>{invoice.invoiceNo}</span>
        <span style={{ width: "80px" }}></span>
      </div>

      {/* TOP CONTENT WRAPPER */}
      <div style={{ flex: 1 }}>
        {/* HEADER WITH LOGO */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid #000",
            paddingBottom: "10px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <img
              src="/logo.png"
              alt="Company Logo"
              style={{ width: "65px", height: "65px", objectFit: "contain" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div>
              <h1
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "19px",
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
                margin: "0 0 6px 0",
                fontSize: "26px",
                color: "#374151",
                textTransform: "uppercase",
              }}
            >
              Invoice
            </h2>
            <p
              style={{ margin: "3px 0", fontSize: "13px", fontWeight: "bold" }}
            >
              Invoice No: {invoice.invoiceNo}
            </p>
            <p style={{ margin: "3px 0", fontSize: "13px" }}>
              Date: {invoice.date}
            </p>
          </div>
        </div>

        {/* META DATA */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "16px",
            fontSize: "13px",
          }}
        >
          <div style={{ width: "48%" }}>
            <h3
              style={{
                borderBottom: "1px solid #000",
                paddingBottom: "4px",
                marginBottom: "6px",
                fontSize: "14px",
                marginTop: 0,
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
                marginBottom: "6px",
                fontSize: "14px",
                marginTop: 0,
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

        {/* ITEMS TABLE (Balanced column widths with a 52% Description column) */}
        <table
          className="print-table"
          style={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            marginTop: "8px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  width: "4%",
                  textAlign: "center",
                  border: "1.5px solid #000",
                  padding: "6px 2px",
                  fontSize: "12px",
                  backgroundColor: "#f3f4f6",
                }}
              >
                #
              </th>
              <th
                style={{
                  width: "52%",
                  border: "1.5px solid #000",
                  padding: "6px 8px",
                  fontSize: "12px",
                  backgroundColor: "#f3f4f6",
                  textAlign: "left",
                }}
              >
                Description
              </th>
              <th
                style={{
                  width: "6%",
                  textAlign: "center",
                  border: "1.5px solid #000",
                  padding: "6px 2px",
                  fontSize: "12px",
                  backgroundColor: "#f3f4f6",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  width: "8%",
                  textAlign: "center",
                  border: "1.5px solid #000",
                  padding: "6px 4px",
                  fontSize: "12px",
                  backgroundColor: "#f3f4f6",
                }}
              >
                Unit
              </th>
              <th
                style={{
                  width: "12%",
                  textAlign: "right",
                  border: "1.5px solid #000",
                  padding: "6px 6px",
                  fontSize: "12px",
                  backgroundColor: "#f3f4f6",
                }}
              >
                Rate (Rs.)
              </th>
              <th
                style={{
                  width: "6%",
                  textAlign: "right",
                  border: "1.5px solid #000",
                  padding: "6px 4px",
                  fontSize: "12px",
                  backgroundColor: "#f3f4f6",
                }}
              >
                Disc
              </th>
              <th
                style={{
                  width: "12%",
                  textAlign: "right",
                  border: "1.5px solid #000",
                  padding: "6px 6px",
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
                    padding: "6px 2px",
                    fontSize: "12px",
                  }}
                >
                  {index + 1}
                </td>
                <td
                  style={{
                    border: "1.5px solid #000",
                    padding: "6px 8px",
                    fontSize: "12px",
                    wordWrap: "break-word",
                  }}
                >
                  {item.description}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    border: "1.5px solid #000",
                    padding: "6px 2px",
                    fontSize: "12px",
                  }}
                >
                  {item.quantity}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    border: "1.5px solid #000",
                    padding: "6px 4px",
                    fontSize: "12px",
                  }}
                >
                  {item.unitType}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    border: "1.5px solid #000",
                    padding: "6px 6px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatCurrency(item.rate)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    border: "1.5px solid #000",
                    padding: "6px 4px",
                    fontSize: "12px",
                  }}
                >
                  {item.discountPercentage}%
                </td>
                <td
                  style={{
                    textAlign: "right",
                    border: "1.5px solid #000",
                    padding: "6px 6px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
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
            marginTop: "16px",
          }}
        >
          <div style={{ width: "48%" }}>
            <div
              style={{
                padding: "8px",
                minHeight: "65px",
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

          <div style={{ width: "290px", fontSize: "13px" }}>
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
                {invoice.isVatApplied ? `${settings?.vatRate || 18}%` : "0%"}):
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

      {/* FOOTER & BOTTOM PAGE NUMBER */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: "20px",
          textAlign: "center",
          color: "#4b5563",
          fontSize: "12px",
        }}
      >
        <p style={{ marginBottom: "25px" }}>Thank you for your business!</p>
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
              paddingTop: "6px",
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
              paddingTop: "6px",
              color: "#000",
              fontSize: "12px",
            }}
          >
            Authorized Signatory
          </div>
        </div>

        {/* PAGE NUMBER AT BOTTOM RIGHT */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "12px",
            fontSize: "11px",
            color: "#000",
          }}
        >
          <span>1/1</span>
        </div>
      </div>
    </div>
  );
});

export default InvoicePrintTemplate;
