
import { useEffect, useState } from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";

function StockAdjustmentModal({
  isOpen,
  onClose,
  onSubmit,
  inventoryItem = null,
  materials = [],
  warehouses = [],
  loading = false,
}) {
  const [form, setForm] = useState({
    material_id: "",
    warehouse_id: "",
    adjustment_type: "increase",
    quantity: "",
    notes: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm({
        material_id: inventoryItem
          ? String(inventoryItem.material_id)
          : "",
        warehouse_id: inventoryItem
          ? String(inventoryItem.warehouse_id)
          : "",
        adjustment_type: "increase",
        quantity: "",
        notes: "",
      });

      setError("");
    }
  }, [isOpen, inventoryItem]);

  if (!isOpen) return null;

  const currentStock = inventoryItem
    ? Number(inventoryItem.quantity_on_hand)
    : null;

  const selectedMaterial = materials.find(
    (item) => item.id === Number(form.material_id)
  );

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.material_id || !form.warehouse_id) {
      setError("Please select a material and warehouse.");
      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Enter a quantity greater than zero.");
      return;
    }

    if (
      form.adjustment_type === "decrease" &&
      inventoryItem &&
      quantity > currentStock
    ) {
      setError("Adjustment quantity exceeds available stock.");
      return;
    }

    const payload = {
      material_id: Number(form.material_id),
      warehouse_id: Number(form.warehouse_id),
      adjustment_type: form.adjustment_type,
      quantity: String(form.quantity),
      notes: form.notes.trim() || null,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to adjust inventory."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Stock Adjustment
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Increase or decrease available stock.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Material */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Material *
            </label>

            <select
              required
              value={form.material_id}
              disabled={Boolean(inventoryItem)}
              onChange={(e) =>
                updateField("material_id", e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select material</option>

              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.material_name}
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Warehouse *
            </label>

            <select
              required
              value={form.warehouse_id}
              disabled={Boolean(inventoryItem)}
              onChange={(e) =>
                updateField("warehouse_id", e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select warehouse</option>

              {warehouses
                .filter((warehouse) => warehouse.is_active)
                .map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouse_name}
                  </option>
                ))}
            </select>
          </div>

          {/* Current stock */}
          {inventoryItem && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Current Stock</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {currentStock.toFixed(3)}{" "}
                {selectedMaterial?.unit || ""}
              </p>
            </div>
          )}

          {/* Adjustment Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Adjustment Type *
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  updateField("adjustment_type", "increase")
                }
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
                  form.adjustment_type === "increase"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <TrendingUp size={18} />
                Increase
              </button>

              <button
                type="button"
                onClick={() =>
                  updateField("adjustment_type", "decrease")
                }
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
                  form.adjustment_type === "decrease"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <TrendingDown size={18} />
                Decrease
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Quantity *
            </label>

            <input
              type="number"
              required
              min="0.001"
              step="0.001"
              value={form.quantity}
              onChange={(e) =>
                updateField("quantity", e.target.value)
              }
              placeholder="Enter adjustment quantity"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>

            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) =>
                updateField("notes", e.target.value)
              }
              placeholder="Reason for stock adjustment..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`rounded-lg px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                form.adjustment_type === "increase"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading ? "Processing..." : "Confirm Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StockAdjustmentModal;
