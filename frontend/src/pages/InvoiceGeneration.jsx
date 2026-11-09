import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Plus, Trash2, Save, Search } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const InvoiceGeneration = () => {
  const [customers, setCustomers] = useState([]);
  const [globalVatRate, setGlobalVatRate] = useState(18);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: "Loading...",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    customer: "",
    paymentType: "cash",
    quotationNo: "",
    purchasingNo: "",
    advanceNo: "", // <-- Advance No. in metadata
    billDiscount: 0,
    advancePaymentDeduction: 0,
    isVatApplied: false,
    remarks: "",
  });

  const [items, setItems] = useState([
    {
      description: "",
      unitType: "NOS",
      quantity: 1,
      rate: 0,
      discountPercentage: 0,
      itemTotal: 0,
    },
  ]);

  const [totals, setTotals] = useState({
    billTotal: 0,
    discountAmount: 0,
    vatAmount: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [customersRes, nextIdRes, settingsRes] = await Promise.all([
          axios.get(`${API_URL}/api/customers`),
          axios.get(`${API_URL}/api/invoices/next-invoice-no`),
          axios.get(`${API_URL}/api/settings`),
        ]);

        setCustomers(customersRes.data);
        setInvoiceData((prev) => ({
          ...prev,
          invoiceNo: nextIdRes.data.nextInvoiceNo,
        }));

        if (settingsRes.data && settingsRes.data.vatRate) {
          setGlobalVatRate(settingsRes.data.vatRate);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const calculateTotals = () => {
      const billTotal = items.reduce(
        (sum, item) => sum + Number(item.itemTotal),
        0,
      );

      const discountPercentage = Number(invoiceData.billDiscount || 0);
      const discountAmount = billTotal * (discountPercentage / 100);
      const discountedBill = billTotal - discountAmount;

      const vatAmount = invoiceData.isVatApplied
        ? discountedBill * (globalVatRate / 100)
        : 0;

      const grandTotal =
        discountedBill +
        vatAmount -
        Number(invoiceData.advancePaymentDeduction || 0);

      setTotals({ billTotal, discountAmount, vatAmount, grandTotal });
    };
    calculateTotals();
  }, [
    items,
    invoiceData.billDiscount,
    invoiceData.advancePaymentDeduction,
    invoiceData.isVatApplied,
    globalVatRate,
  ]);

  const handleMetaChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setInvoiceData({ ...invoiceData, [e.target.name]: value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
    if (invoiceData.customer) {
      setInvoiceData({ ...invoiceData, customer: "" });
    }
  };

  const handleSelectCustomer = (customer) => {
    setInvoiceData({ ...invoiceData, customer: customer._id });
    setSearchTerm(`${customer.name} - ${customer.telephone}`);
    setIsDropdownOpen(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telephone.includes(searchTerm),
  );

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (["quantity", "rate", "discountPercentage"].includes(field)) {
      const qty = Number(newItems[index].quantity || 0);
      const rate = Number(newItems[index].rate || 0);
      const discount = Number(newItems[index].discountPercentage || 0);

      const baseTotal = qty * rate;
      newItems[index].itemTotal = baseTotal - baseTotal * (discount / 100);
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        unitType: "NOS",
        quantity: 1,
        rate: 0,
        discountPercentage: 0,
        itemTotal: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceData.customer)
      return alert(
        "Please search and select a valid customer from the dropdown.",
      );

    const payload = {
      ...invoiceData,
      items,
      billTotal: totals.billTotal,
      vatAmount: totals.vatAmount,
      grandTotal: totals.grandTotal,
    };

    try {
      await axios.post(`${API_URL}/api/invoices`, payload);
      alert("Invoice (and Dispatch Note) generated successfully!");

      const nextIdRes = await axios.get(
        `${API_URL}/api/invoices/next-invoice-no`,
      );

      setInvoiceData({
        ...invoiceData,
        invoiceNo: nextIdRes.data.nextInvoiceNo,
        customer: "",
        quotationNo: "",
        purchasingNo: "",
        advanceNo: "",
        billDiscount: 0,
        advancePaymentDeduction: 0,
        remarks: "",
      });
      setSearchTerm("");
      setItems([
        {
          description: "",
          unitType: "NOS",
          quantity: 1,
          rate: 0,
          discountPercentage: 0,
          itemTotal: 0,
        },
      ]);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert(error.response?.data?.message || "Failed to generate invoice");
    }
  };

  return (
    <div
      className="page-container"
      style={{ maxWidth: "1100px", margin: "0 auto" }}
    >
      <div className="page-header">
        <h1>Generate New Invoice</h1>
        <button className="btn btn-primary" onClick={handleSubmit}>
          <Save size={18} /> Save & Generate
        </button>
      </div>

      <form className="form-grid" style={{ marginBottom: "2rem" }}>
        {/* Row 1 */}
        <div className="form-group">
          <label>Invoice No.</label>
          <input
            type="text"
            name="invoiceNo"
            value={invoiceData.invoiceNo}
            readOnly
            style={{
              backgroundColor: "#f3f4f6",
              color: "#6b7280",
              cursor: "not-allowed",
            }}
          />
        </div>
        <div
          className="form-group"
          style={{ display: "flex", gap: "1rem", flexDirection: "row" }}
        >
          <div style={{ flex: 1 }}>
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={invoiceData.date}
              onChange={handleMetaChange}
              style={{ width: "100%" }}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Time</label>
            <input
              type="time"
              name="time"
              value={invoiceData.time}
              onChange={handleMetaChange}
              style={{ width: "100%" }}
              required
            />
          </div>
        </div>

        {/* Row 2 */}
        <div
          className="form-group"
          ref={dropdownRef}
          style={{ position: "relative" }}
        >
          <label>Search Customer *</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              padding: "0 0.5rem",
            }}
          >
            <Search size={16} color="#6b7280" />
            <input
              type="text"
              placeholder="Type name or phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setIsDropdownOpen(true)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "none",
                outline: "none",
              }}
              required
            />
          </div>

          {isDropdownOpen && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 10,
                listStyle: "none",
                padding: 0,
                margin: "0.25rem 0 0 0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <li
                    key={c._id}
                    onClick={() => handleSelectCustomer(c)}
                    style={{
                      padding: "0.5rem 1rem",
                      cursor: "pointer",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "white")
                    }
                  >
                    <strong>{c.name}</strong> <br />
                    <small style={{ color: "#6b7280" }}>
                      {c.telephone} | {c.address}
                    </small>
                  </li>
                ))
              ) : (
                <li style={{ padding: "0.5rem 1rem", color: "#6b7280" }}>
                  No customers found...
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label>Payment Type</label>
          <select
            name="paymentType"
            value={invoiceData.paymentType}
            onChange={handleMetaChange}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
            }}
          >
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="online">Online</option>
            <option value="credit">Credit</option>
          </select>
        </div>

        {/* Row 3: Quotation, Purchasing, and Advance Nos */}
        <div className="form-group">
          <label>Quotation No. (Optional)</label>
          <input
            type="text"
            name="quotationNo"
            value={invoiceData.quotationNo}
            onChange={handleMetaChange}
          />
        </div>
        <div className="form-group">
          <label>Purchasing No. (Optional)</label>
          <input
            type="text"
            name="purchasingNo"
            value={invoiceData.purchasingNo}
            onChange={handleMetaChange}
          />
        </div>
        <div className="form-group">
          <label>Advance No. (Optional)</label>
          <input
            type="text"
            name="advanceNo"
            value={invoiceData.advanceNo}
            onChange={handleMetaChange}
            placeholder="Advance No."
          />
        </div>

        {/* Row 4: Remarks */}
        <div className="form-group full-width">
          <label>Remarks / Notes</label>
          <textarea
            name="remarks"
            value={invoiceData.remarks}
            onChange={handleMetaChange}
            rows="2"
            placeholder="Optional payment instructions or notes..."
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              resize: "vertical",
            }}
          />
        </div>
      </form>

      {/* LINE ITEMS SECTION */}
      <h3
        style={{
          marginBottom: "1rem",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "0.5rem",
        }}
      >
        Line Items
      </h3>
      <div className="table-container" style={{ overflow: "visible" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th width="40" style={{ textAlign: "center" }}>
                #
              </th>
              <th>Description</th>
              <th width="120">Unit</th>
              <th width="100">Qty</th>
              <th width="120">Rate</th>
              <th width="100">Disc (%)</th>
              <th width="120">Total</th>
              <th width="50"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    color: "#6b7280",
                  }}
                >
                  {index + 1}
                </td>
                <td>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    style={{ width: "100%", padding: "0.4rem" }}
                    placeholder="Item name"
                    required
                  />
                </td>
                <td>
                  <select
                    value={item.unitType}
                    onChange={(e) =>
                      handleItemChange(index, "unitType", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "0.4rem",
                      borderRadius: "4px",
                      border: "1px solid #d1d5db",
                    }}
                    required
                  >
                    <option value="NOS">NOS</option>
                    <option value="lengths">Lengths</option>
                    <option value="Meters">Meters</option>
                    <option value="Feet">Feet</option>
                    <option value="square feets">Square Feets</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    style={{ width: "100%", padding: "0.4rem" }}
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.rate}
                    onChange={(e) =>
                      handleItemChange(index, "rate", e.target.value)
                    }
                    style={{ width: "100%", padding: "0.4rem" }}
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discountPercentage}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "discountPercentage",
                        e.target.value,
                      )
                    }
                    style={{ width: "100%", padding: "0.4rem" }}
                  />
                </td>
                <td style={{ fontWeight: "bold" }}>
                  {item.itemTotal.toFixed(2)}
                </td>
                <td>
                  <button
                    className="btn-icon"
                    onClick={() => removeItem(index)}
                    style={{ color: "#ef4444" }}
                    type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        className="btn btn-secondary"
        onClick={addItem}
        style={{ marginTop: "1rem" }}
        type="button"
      >
        <Plus size={18} /> Add Item
      </button>

      {/* TOTALS SECTION */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "2rem",
        }}
      >
        <div
          style={{
            width: "350px",
            background: "#f9fafb",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
            }}
          >
            <span>Bill Total:</span>
            <strong>{totals.billTotal.toFixed(2)}</strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
              alignItems: "center",
            }}
          >
            <span>Bill Discount (%):</span>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span style={{ color: "#ef4444", fontSize: "0.875rem" }}>
                (-{totals.discountAmount?.toFixed(2) || "0.00"})
              </span>
              <input
                type="number"
                name="billDiscount"
                min="0"
                max="100"
                value={invoiceData.billDiscount}
                onChange={handleMetaChange}
                style={{
                  width: "80px",
                  padding: "0.25rem",
                  textAlign: "right",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
              alignItems: "center",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="isVatApplied"
                checked={invoiceData.isVatApplied}
                onChange={handleMetaChange}
              />
              Apply VAT ({globalVatRate}%)
            </label>
            <span>{totals.vatAmount.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
              alignItems: "center",
              borderBottom: "1px solid #d1d5db",
              paddingBottom: "1rem",
            }}
          >
            <span>Advance Deduction (-):</span>
            <input
              type="number"
              name="advancePaymentDeduction"
              value={invoiceData.advancePaymentDeduction}
              onChange={handleMetaChange}
              style={{ width: "100px", padding: "0.25rem", textAlign: "right" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1.25rem",
              color: "#111827",
            }}
          >
            <strong>Grand Total:</strong>
            <strong>{totals.grandTotal.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGeneration;
