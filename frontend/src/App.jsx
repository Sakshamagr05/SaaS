import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Suppliers from "./pages/Suppliers";
import Materials from "./pages/Materials";
import PurchaseOrders from "./pages/PurchaseOrders";
import Warehouses from "./pages/Warehouses";
import Shipments from "./pages/Shipments";
import Inventory from "./pages/Inventory";
import InventoryTransactions from "./pages/InventoryTransactions";

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

          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />          
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory-transactions" element={<InventoryTransactions />}/>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;