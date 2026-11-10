import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersManagement from "./pages/UsersManagement";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Invoices from "./pages/Invoices";
import DispatchNotes from "./pages/DispatchNotes";
import PurchaseOrders from "./pages/PurchaseOrders";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import MainLayout from "./layouts/MainLayout"; // your sidebar/navigation wrapper

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    // If not authenticated, force redirect to /login
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* Default route `/`: If logged in go to dashboard, otherwise start at /login */}
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

        {/* Protected App Routes inside Main Layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UsersManagement />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/dispatch-notes" element={<DispatchNotes />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch-all unknown routes: redirect to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
