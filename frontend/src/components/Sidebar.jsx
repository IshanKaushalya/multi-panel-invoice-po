import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  ShoppingCart,
  BarChart3,
  Settings,
  ClipboardList,
  UserCog,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Customers", path: "/customers", icon: <Users size={20} /> },
    { name: "Suppliers", path: "/suppliers", icon: <Truck size={20} /> },
    { name: "Invoices", path: "/invoices", icon: <FileText size={20} /> },
    {
      name: "Dispatch Notes",
      path: "/dispatch-notes",
      icon: <ClipboardList size={20} />,
    },
    { name: "Purchase Orders", path: "/pos", icon: <ShoppingCart size={20} /> },
    { name: "Reports", path: "/reports", icon: <BarChart3 size={20} /> },
    { name: "Users", path: "/users", icon: <UserCog size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <aside
      className="sidebar"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          className="sidebar-header"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <img
            src="/logo.png"
            alt="Company Logo"
            style={{
              width: "36px",
              height: "36px",
              objectFit: "contain",
              borderRadius: "4px",
              background: "white",
              padding: "2px",
            }}
          />
          <span>MULTI ENGINEERING-PANEL-PO-INVOICING</span>
        </div>
        <nav className="nav-links">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Button Section */}
      <div style={{ padding: "1rem" }}>
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            fontWeight: "600",
            textAlign: "left",
          }}
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
