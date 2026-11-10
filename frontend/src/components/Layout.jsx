import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Truck,
  FileText,
  FileSpreadsheet,
  ShoppingBag,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#0f172a",
      }}
    >
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "#1e293b",
          color: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #334155",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "1.5rem 1rem",
            borderBottom: "1px solid #334155",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontSize: "0.9rem",
              fontWeight: "bold",
              margin: 0,
              color: "#38bdf8",
            }}
          >
            MULTI ENGINEERING
          </h3>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            PO & Invoicing System
          </span>
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            flex: 1,
            padding: "1rem 0.5rem",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          <SidebarLink
            to="/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
          />
          <SidebarLink
            to="/customers"
            icon={<Building2 size={18} />}
            label="Customers"
          />
          <SidebarLink
            to="/suppliers"
            icon={<Truck size={18} />}
            label="Suppliers"
          />
          <SidebarLink
            to="/invoices"
            icon={<FileText size={18} />}
            label="Invoices"
          />
          <SidebarLink
            to="/dispatch-notes"
            icon={<FileSpreadsheet size={18} />}
            label="Dispatch Notes"
          />
          <SidebarLink
            to="/purchase-orders"
            icon={<ShoppingBag size={18} />}
            label="Purchase Orders"
          />
          <SidebarLink
            to="/reports"
            icon={<BarChart3 size={18} />}
            label="Reports"
          />
          <SidebarLink to="/users" icon={<Users size={18} />} label="Users" />
          <SidebarLink
            to="/settings"
            icon={<SettingsIcon size={18} />}
            label="Settings"
          />
        </nav>

        {/* Logout Footer */}
        <div style={{ padding: "1rem", borderTop: "1px solid #334155" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              backgroundColor: "transparent",
              color: "#f87171",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
            }}
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: "#f8fafc",
          padding: "2rem",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

// Helper component for sidebar links
function SidebarLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem 1rem",
        color: "#cbd5e1",
        textDecoration: "none",
        borderRadius: "6px",
        fontSize: "0.9rem",
        fontWeight: "500",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      {icon}
      {label}
    </Link>
  );
}
