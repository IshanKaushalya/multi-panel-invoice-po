import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import UsersManagement from "./pages/UsersManagement";

// Import your existing pages (adjust only the filenames to match your files in src/pages/)
// If any page has a different name, make sure the casing matches exactly!
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Invoices from "./pages/Invoices";
import DispatchNotes from "./pages/DispatchNotes";
import PurchaseOrders from "./pages/PurchaseOrders";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// If you have a Sidebar component, import it; otherwise, render children directly
import Sidebar from "./components/Sidebar";

// Protected Layout: ensures unauthenticated visitors go straight to /login
const ProtectedLayout = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div
      className="app-container"
      style={{ display: "flex", height: "100vh", overflow: "hidden" }}
    >
      {Sidebar && <Sidebar />}
      <main style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {children}
      </main>
    </div>
  );
};

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* If no path is specified, start at /login unless already authenticated */}
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Application Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedLayout>
              <UsersManagement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedLayout>
              <Customers />
            </ProtectedLayout>
          }
        />
        <Route
          path="/suppliers"
          element={
            <ProtectedLayout>
              <Suppliers />
            </ProtectedLayout>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedLayout>
              <Invoices />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dispatch-notes"
          element={
            <ProtectedLayout>
              <DispatchNotes />
            </ProtectedLayout>
          }
        />
        <Route
          path="/purchase-orders"
          element={
            <ProtectedLayout>
              <PurchaseOrders />
            </ProtectedLayout>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedLayout>
              <Reports />
            </ProtectedLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedLayout>
              <Settings />
            </ProtectedLayout>
          }
        />

        {/* Unknown path fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
