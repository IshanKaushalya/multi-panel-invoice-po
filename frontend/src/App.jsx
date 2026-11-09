import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login"; // <-- Import Login page
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Application Routes inside Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
