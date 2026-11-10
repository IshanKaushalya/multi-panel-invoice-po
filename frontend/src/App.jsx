import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layout & Components
import Layout from "./components/Layout";

// Auth & Core Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersManagement from "./pages/UsersManagement";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// Invoices
import InvoiceList from "./pages/InvoiceList";
import InvoiceGeneration from "./pages/InvoiceGeneration";
import InvoiceEdit from "./pages/InvoiceEdit";

// Dispatch Notes
import DispatchNoteList from "./pages/DispatchNoteList";

// Purchase Orders
import PurchaseOrderList from "./pages/PurchaseOrderList";
import PurchaseOrderGeneration from "./pages/PurchaseOrderGeneration";
import PurchaseOrderEdit from "./pages/PurchaseOrderEdit";

// Route protection component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* Default entry point: Start at /login unless already authenticated */}
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

        {/* Protected Application Routes wrapped with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UsersManagement />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />

          {/* Invoices */}
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/new" element={<InvoiceGeneration />} />
          <Route path="/invoices/edit/:id" element={<InvoiceEdit />} />

          {/* Dispatch Notes */}
          <Route path="/dispatch-notes" element={<DispatchNoteList />} />

          {/* Purchase Orders */}
          <Route path="/purchase-orders" element={<PurchaseOrderList />} />
          <Route
            path="/purchase-orders/new"
            element={<PurchaseOrderGeneration />}
          />
          <Route
            path="/purchase-orders/edit/:id"
            element={<PurchaseOrderEdit />}
          />

          {/* Reports & Settings */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch-all unknown routes: redirect to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
