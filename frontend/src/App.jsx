import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";

function PlaceholderPage({ title }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        This module will be implemented in the upcoming phase.
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/suppliers" element={<PlaceholderPage title="Suppliers" />} />
          <Route path="/materials" element={<PlaceholderPage title="Materials" />} />
          <Route path="/purchase-orders" element={<PlaceholderPage title="Purchase Orders" />} />
          <Route path="/warehouses" element={<PlaceholderPage title="Warehouses" />} />
          <Route path="/shipments" element={<PlaceholderPage title="Shipments" />} />
          <Route path="/inventory" element={<PlaceholderPage title="Inventory" />} />
          <Route path="/inventory/transactions" element={<PlaceholderPage title="Inventory Transactions" />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;