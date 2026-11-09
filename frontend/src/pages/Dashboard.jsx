import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Users, Truck, FileText, ShoppingCart, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    suppliers: 0,
    invoices: 0,
    pos: 0,
  });

  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentPOs, setRecentPOs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data concurrently for maximum speed
        const [custRes, suppRes, invRes, poRes] = await Promise.all([
          axios.get(`${API_URL}/api/customers`),
          axios.get(`${API_URL}/api/suppliers`),
          axios.get(`${API_URL}/api/invoices`),
          axios.get(`${API_URL}/api/purchase-orders`),
        ]);

        // Update high-level summary counts
        setStats({
          customers: custRes.data.length,
          suppliers: suppRes.data.length,
          invoices: invRes.data.length,
          pos: poRes.data.length,
        });

        // Sort by date (newest first) and grab the top 5 for recent activity
        const sortedInvoices = invRes.data
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        const sortedPOs = poRes.data
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        setRecentInvoices(sortedInvoices);
        setRecentPOs(sortedPOs);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // Reusable widget card style
  const cardStyle = {
    background: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  };

  const iconWrapperStyle = (bgColor, color) => ({
    background: bgColor,
    color: color,
    padding: "1rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>System Overview</h1>
        <p style={{ color: "#6b7280" }}>Welcome back to the Dashboard.</p>
      </div>

      {/* SUMMARY WIDGETS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div style={cardStyle}>
          <div>
            <p
              style={{
                margin: "0 0 0.5rem 0",
                color: "#6b7280",
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              Total Customers
            </p>
            <h2 style={{ margin: 0, fontSize: "2rem" }}>{stats.customers}</h2>
          </div>
          <div style={iconWrapperStyle("#dbeafe", "#3b82f6")}>
            <Users size={28} />
          </div>
        </div>

        <div style={cardStyle}>
          <div>
            <p
              style={{
                margin: "0 0 0.5rem 0",
                color: "#6b7280",
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              Total Suppliers
            </p>
            <h2 style={{ margin: 0, fontSize: "2rem" }}>{stats.suppliers}</h2>
          </div>
          <div style={iconWrapperStyle("#d1fae5", "#10b981")}>
            <Truck size={28} />
          </div>
        </div>

        <div style={cardStyle}>
          <div>
            <p
              style={{
                margin: "0 0 0.5rem 0",
                color: "#6b7280",
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              Generated Invoices
            </p>
            <h2 style={{ margin: 0, fontSize: "2rem" }}>{stats.invoices}</h2>
          </div>
          <div style={iconWrapperStyle("#fef3c7", "#f59e0b")}>
            <FileText size={28} />
          </div>
        </div>

        <div style={cardStyle}>
          <div>
            <p
              style={{
                margin: "0 0 0.5rem 0",
                color: "#6b7280",
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              Purchase Orders
            </p>
            <h2 style={{ margin: 0, fontSize: "2rem" }}>{stats.pos}</h2>
          </div>
          <div style={iconWrapperStyle("#f3e8ff", "#8b5cf6")}>
            <ShoppingCart size={28} />
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY GRIDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* Recent Invoices */}
        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ margin: 0 }}>Recent Invoices</h3>
            <Link
              to="/invoices"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#3b82f6",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div
            className="table-container"
            style={{
              margin: 0,
              boxShadow: "none",
              border: "1px solid #e5e7eb",
            }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Customer</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr key={inv._id}>
                    <td>
                      <strong>{inv.invoiceNo}</strong>
                    </td>
                    <td>{inv.customer?.name || "Unknown"}</td>
                    <td style={{ fontWeight: "bold" }}>
                      {inv.grandTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {recentInvoices.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      style={{
                        textAlign: "center",
                        padding: "1rem",
                        color: "#6b7280",
                      }}
                    >
                      No recent invoices.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent POs */}
        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ margin: 0 }}>Recent Purchase Orders</h3>
            <Link
              to="/pos"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#3b82f6",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div
            className="table-container"
            style={{
              margin: 0,
              boxShadow: "none",
              border: "1px solid #e5e7eb",
            }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Supplier</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentPOs.map((po) => (
                  <tr key={po._id}>
                    <td>
                      <strong>{po.poNo}</strong>
                    </td>
                    <td>{po.supplier?.name || "Unknown"}</td>
                    <td style={{ fontWeight: "bold" }}>
                      {po.grandTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {recentPOs.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      style={{
                        textAlign: "center",
                        padding: "1rem",
                        color: "#6b7280",
                      }}
                    >
                      No recent purchase orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
