
import { useState } from "react";
import {
  Package,
  Warehouse,
  Boxes,
  Plus,
  RefreshCw,
} from "lucide-react";

import { useInventory } from "../hooks/useInventory";
import { useMaterials } from "../hooks/useMaterials";
import { useWarehouses } from "../hooks/useWarehouses";

import InventoryTable from "../components/inventory/InventoryTable";
import StockAdjustmentModal from "../components/inventory/StockAdjustmentModal";

function Inventory() {
  const {
    inventory,
    loading,
    error,
    fetchInventory,
    adjustInventory,
  } = useInventory();

  const { materials = [] } = useMaterials();
  const { warehouses = [] } = useWarehouses();

  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Open adjustment from an existing inventory record
  const handleAdjustExisting = (item) => {
    setSelectedInventory(item);
    setPageError("");
    setSuccessMessage("");
    setIsAdjustmentOpen(true);
  };

  // Open adjustment for a new material/warehouse combination
  const handleCreateAdjustment = () => {
    setSelectedInventory(null);
    setPageError("");
    setSuccessMessage("");
    setIsAdjustmentOpen(true);
  };

  // Submit stock adjustment
  const handleAdjustmentSubmit = async (data) => {
    try {
      setSaving(true);
      setPageError("");
      setSuccessMessage("");

      await adjustInventory(data);

      setIsAdjustmentOpen(false);
      setSelectedInventory(null);
      setSuccessMessage("Inventory adjusted successfully.");

      // Refresh to ensure the displayed balance is current
      await fetchInventory();
    } catch (err) {
      setPageError(
        err.response?.data?.detail ||
          "Failed to adjust inventory."
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const closeAdjustmentModal = () => {
    setIsAdjustmentOpen(false);
    setSelectedInventory(null);
  };

  // Summary values
  const totalRecords = inventory.length;

  const totalWarehouses = new Set(
    inventory.map((item) => item.warehouse_id)
  ).size;

  const totalMaterials = new Set(
    inventory.map((item) => item.material_id)
  ).size;

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Package size={25} className="text-blue-600" />

            <h1 className="text-2xl font-bold text-gray-900">
              Inventory
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Monitor stock levels across your warehouses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={handleCreateAdjustment}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Adjust Stock
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Inventory Records
            </p>
            <Package size={20} className="text-blue-600" />
          </div>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {totalRecords}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Warehouses with Stock
            </p>
            <Warehouse size={20} className="text-purple-600" />
          </div>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {totalWarehouses}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Materials in Stock
            </p>
            <Boxes size={20} className="text-green-600" />
          </div>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {totalMaterials}
          </h2>
        </div>
      </div>

      {/* Feedback */}
      {(error || pageError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {pageError || error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Inventory Table */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-500">
          Loading inventory...
        </div>
      ) : (
        <InventoryTable
          inventory={inventory}
          materials={materials}
          warehouses={warehouses}
          onAdjust={handleAdjustExisting}
        />
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustmentOpen}
        onClose={closeAdjustmentModal}
        onSubmit={handleAdjustmentSubmit}
        inventoryItem={selectedInventory}
        materials={materials}
        warehouses={warehouses}
        loading={saving}
      />
    </div>
  );
}

export default Inventory;
