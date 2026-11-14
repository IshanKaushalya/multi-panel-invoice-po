import React, { useState, useEffect } from "react";

const DispatchNotePrintTemplate = React.forwardRef(
  ({ note, settings }, ref) => {
    const [fetchedCustomer, setFetchedCustomer] = useState(null);

    const existingCustomer =
      note?.invoiceId?.customer ||
      note?.invoice?.customer ||
      note?.customer ||
      null;

    useEffect(() => {
      if (!note) return;

      // If customer details are already present and populated, no need to fetch
      if (existingCustomer && existingCustomer.name) {
        setFetchedCustomer(null);
        return;
      }

      // Otherwise, fetch the related invoice to get the customer details
      const fetchRelatedInvoice = async () => {
        try {
          const token = localStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const baseUrl = import.meta.env?.VITE_API_URL || "";

          const rawInvoiceId =
            typeof note.invoiceId === "object"
              ? note.invoiceId?._id
              : note.invoiceId;

          if (rawInvoiceId) {
            const res = await fetch(`${baseUrl}/api/invoices/${rawInvoiceId}`, {
              headers,
            });
            if (res.ok) {
              const invData = await res.json();
              if (invData?.customer) {
                setFetchedCustomer(invData.customer);
                return;
              }
            }
          }

          // Fallback: search in invoices list by invoiceNo
          if (note.invoiceNo) {
            const res = await fetch(`${baseUrl}/api/invoices`, { headers });
            if (res.ok) {
              const invoices = await res.json();
              const matched = Array.isArray(invoices)
                ? invoices.find((inv) => inv.invoiceNo === note.invoiceNo)
                : null;
              if (matched?.customer) {
                setFetchedCustomer(matched.customer);
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch invoice customer:", err);
        }
      };

      fetchRelatedInvoice();
    }, [note, existingCustomer]);

    if (!note) return <div ref={ref} style={{ display: "none" }}></div>;

    const displayCompanyName =
      settings?.companyName && settings.companyName.trim() !== "My Company"
        ? settings.companyName
        : "Multi Engineering Services Lanka (Pvt) Ltd";

    const customer =
      existingCustomer && existingCustomer.name
        ? existingCustomer
        : fetchedCustomer || {};

    const purchasingNo =
      note.purchasingNo ||
      note.invoiceId?.purchasingNo ||
      note.invoice?.purchasingNo ||
      "N/A";

    const handleDirectPrint = () => {
      if (ref && ref.current) {
        const printContents = ref.current.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = `
          <html>
            <head>
              <title>Dispatch Note - ${note.dispatchNo || ""}</title>
              <style>
                body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1.5px solid #000; padding: 8px; font-size: 12px; }
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
        window.location.reload();
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

        {/* DISPATCH NOTE CONTAINER */}
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
                }}
              >
                <img
                  src="/logo.png"
                  alt="Company Logo"
                  style={{
                    width: "75px",
                    height: "75px",
                    objectFit: "contain",
                  }}
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
                      whiteSpace: "nowrap",
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

              <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
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

            {/* CUSTOMER & REFERENCE DETAILS SECTION */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "30px",
              }}
            >
              {/* Bill To / Customer Details from Related Invoice */}
              <div style={{ width: "48%" }}>
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
                  {customer.name || note.customerName || "N/A"}
                </p>
                <p style={{ margin: "2px 0" }}>
                  Phone:{" "}
                  {customer.telephone ||
                    customer.phone ||
                    note.customerPhone ||
                    "N/A"}
                </p>
                <p style={{ margin: "2px 0" }}>
                  Address: {customer.address || note.customerAddress || "N/A"}
                </p>
              </div>

              {/* Reference Details */}
              <div style={{ width: "48%" }}>
                <h3
                  style={{
                    borderBottom: "1px solid #000",
                    paddingBottom: "5px",
                    marginBottom: "10px",
                  }}
                >
                  Reference Details:
                </h3>
                <p style={{ margin: "2px 0" }}>
                  Linked Invoice No: <strong>{note.invoiceNo}</strong>
                </p>
                <p style={{ margin: "2px 0" }}>
                  Purchasing No: <strong>{purchasingNo}</strong>
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
      </div>
    );
  },
);

export default DispatchNotePrintTemplate;
