import React from "react";

const DispatchNotePrintTemplate = React.forwardRef(
  ({ note, settings }, ref) => {
    if (!note) return <div ref={ref} style={{ display: "none" }}></div>;

    const displayCompanyName =
      settings?.companyName && settings.companyName.trim() !== "My Company"
        ? settings.companyName
        : "Multi Engineering Services Lanka (Pvt) Ltd";

    return (
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
                maxWidth: "65%",
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
                  fontSize: "28px",
                  color: "#374151",
                  textTransform: "uppercase",
                }}
              >
                Dispatch Note
              </h2>
              <p style={{ margin: "5px 0", fontWeight: "bold" }}>
                DNo: {note.dispatchNo}
              </p>
              <p style={{ margin: "5px 0" }}>Date: {note.date}</p>
              <p style={{ margin: "5px 0" }}>Time: {note.time}</p>
            </div>
          </div>

          {/* META DATA */}
          <div style={{ marginBottom: "30px" }}>
            <h3
              style={{
                borderBottom: "1px solid #000",
                paddingBottom: "5px",
                marginBottom: "10px",
              }}
            >
              Reference Details:
            </h3>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ margin: "2px 0" }}>
                Linked Invoice No: <strong>{note.invoiceNo}</strong>
              </p>
              <p style={{ margin: "2px 0" }}>
                Purchasing No: <strong>{note.purchasingNo || "N/A"}</strong>
              </p>
            </div>
          </div>

          {/* ITEMS TABLE WITH NUMBERS */}
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: "40px", textAlign: "center" }}>#</th>
                <th>Item Description</th>
                <th style={{ width: "100px", textAlign: "center" }}>Unit</th>
                <th style={{ width: "140px", textAlign: "center" }}>
                  Dispatched Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {note.items.map((item, index) => (
                <tr key={index}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{item.description}</td>
                  <td style={{ textAlign: "center" }}>
                    {item.unitType || "NOS"}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* REMARKS SECTION */}
          <div style={{ marginTop: "20px", width: "50%" }}>
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
                {note.remarks && note.remarks.trim() !== ""
                  ? note.remarks
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER (PUSHED TO THE BOTTOM WITH WIDE GAP) */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "40px",
            textAlign: "center",
            color: "#4b5563",
            fontSize: "14px",
          }}
        >
          <p style={{ marginBottom: "40px" }}>
            Please verify the items above upon delivery.
          </p>
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
              Received By (Customer Signature)
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
    );
  },
);

export default DispatchNotePrintTemplate;
