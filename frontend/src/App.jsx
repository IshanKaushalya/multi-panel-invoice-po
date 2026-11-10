import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import InvoiceList from "./pages/InvoiceList";
import InvoiceGeneration from "./pages/InvoiceGeneration";
import InvoiceEdit from "./pages/InvoiceEdit";
import PurchaseOrderList from "./pages/PurchaseOrderList";
import PurchaseOrderGeneration from "./pages/PurchaseOrderGeneration";
import PurchaseOrderEdit from "./pages/PurchaseOrderEdit";
import DispatchNoteList from "./pages/DispatchNoteList";
import Reports from "./pages/Reports";
import UsersManagement from "./pages/UsersManagement";
import Settings from "./pages/Settings";
import "./App.css";

// Guard: Redirects unauthenticated users to the login page
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Application Routes inside Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/new" element={<InvoiceGeneration />} />
          <Route path="invoices/edit/:id" element={<InvoiceEdit />} />

          <Route path="pos" element={<PurchaseOrderList />} />
          <Route path="pos/new" element={<PurchaseOrderGeneration />} />
          <Route path="purchase-orders" element={<PurchaseOrderList />} />
          <Route
            path="purchase-orders/new"
            element={<PurchaseOrderGeneration />}
          />
          <Route path="pos/edit/:id" element={<PurchaseOrderEdit />} />
          <Route
            path="purchase-orders/edit/:id"
            element={<PurchaseOrderEdit />}
          />

          <Route path="dispatch-notes" element={<DispatchNoteList />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all unknown routes: redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
