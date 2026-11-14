import React from "react";

const DispatchNotePrintTemplate = React.forwardRef(
  ({ note, settings }, ref) => {
    if (!note) return <div ref={ref} style={{ display: "none" }}></div>;

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

    // Safely extract customer data from the populated invoiceId reference
    const customer = note.invoiceId?.customer || note.customer || {};

    return (
      <div
        ref={ref}
        className="print-root"
        style={{
          width: "100%",
          minHeight: "250mm",
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

        {/* TOP METADATA BAR: Generated Time & Dispatch Number */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "11px",
            color: "#000",
            marginBottom: "10px",
          }}
        >
          <span>{generatedTime}</span>
          <span style={{ fontWeight: "500" }}>DNo: {note.dispatchNo}</span>
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
              marginBottom: "12px",
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
                Dispatch Note
              </h2>
              <p
                style={{
                  margin: "3px 0",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                DNo: {note.dispatchNo}
              </p>
              <p style={{ margin: "3px 0", fontSize: "13px" }}>
                Date: {note.date}
              </p>
              <p style={{ margin: "3px 0", fontSize: "13px" }}>
                Time: {note.time}
              </p>
            </div>
          </div>

          {/* CUSTOMER & REFERENCE DETAILS */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "14px",
              fontSize: "13px",
            }}
          >
            {/* Bill To / Customer Details */}
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
                {customer.name || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                Phone: {customer.telephone || customer.phone || "N/A"}
              </p>
              <p style={{ margin: "2px 0" }}>
                Address: {customer.address || "N/A"}
              </p>
            </div>

            {/* Reference Details */}
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
                Reference Details:
              </h3>
              <p style={{ margin: "2px 0" }}>
                Linked Invoice No: <strong>{note.invoiceNo}</strong>
              </p>
              <p style={{ margin: "2px 0" }}>
                Purchasing No:{" "}
                <strong>
                  {note.purchasingNo || note.invoiceId?.purchasingNo || "N/A"}
                </strong>
              </p>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <table
            className="print-table"
            style={{
              width: "100%",
              tableLayout: "fixed",
              borderCollapse: "collapse",
              marginTop: "6px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    width: "5%",
                    textAlign: "center",
                    border: "1.5px solid #000",
                    padding: "5px 4px",
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    width: "65%",
                    border: "1.5px solid #000",
                    padding: "5px 8px",
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                    textAlign: "left",
                  }}
                >
                  Item Description
                </th>
                <th
                  style={{
                    width: "15%",
                    textAlign: "center",
                    border: "1.5px solid #000",
                    padding: "5px 4px",
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Unit
                </th>
                <th
                  style={{
                    width: "15%",
                    textAlign: "center",
                    border: "1.5px solid #000",
                    padding: "5px 4px",
                    fontSize: "12px",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Dispatched Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {note.items.map((item, index) => (
                <tr key={index}>
                  <td
                    style={{
                      textAlign: "center",
                      border: "1.5px solid #000",
                      padding: "5px 4px",
                      fontSize: "12px",
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      border: "1.5px solid #000",
                      padding: "5px 8px",
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
                      padding: "5px 4px",
                      fontSize: "12px",
                    }}
                  >
                    {item.unitType || "NOS"}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      border: "1.5px solid #000",
                      padding: "5px 4px",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* REMARKS SECTION */}
          <div style={{ marginTop: "12px", width: "50%" }}>
            <div
              style={{
                padding: "6px 8px",
                minHeight: "50px",
                border: "1.5px solid #000",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              <strong>Remarks:</strong>
              <p
                style={{
                  margin: "3px 0 0 0",
                  fontSize: "12px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {note.remarks && note.remarks.trim() !== ""
                  ? note.remarks
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER & SIGNATURES */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "15px",
            textAlign: "center",
            color: "#4b5563",
            fontSize: "12px",
          }}
        >
          <p style={{ marginBottom: "20px" }}>
            Please verify the items above upon delivery.
          </p>
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
              Received By (Customer Signature)
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
              marginTop: "8px",
              fontSize: "11px",
              color: "#000",
            }}
          >
            <span>1/1</span>
          </div>
        </div>
      </div>
    );
  },
);

export default DispatchNotePrintTemplate;
