
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const emptyForm = {
  supplier_id: "",
  warehouse_id: "",
  shipment_number: "",
  dispatch_date: "",
  expected_arrival_date: "",
  tracking_number: "",
  notes: "",
};

function ShipmentForm({
  initialData = null,
  suppliers = [],
  warehouses = [],
  purchaseOrders = [],
  materials = [],
  shipments = [],
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEditing = Boolean(initialData);

  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([
    { purchase_order_item_id: "", shipped_quantity: "" },
  ]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        supplier_id: String(initialData.supplier_id),
        warehouse_id: String(initialData.warehouse_id),
        shipment_number: initialData.shipment_number || "",
        dispatch_date: initialData.dispatch_date || "",
        expected_arrival_date:
          initialData.expected_arrival_date || "",
        tracking_number: initialData.tracking_number || "",
        notes: initialData.notes || "",
      });
    } else {
      setForm(emptyForm);
      setItems([
        { purchase_order_item_id: "", shipped_quantity: "" },
      ]);
    }
  }, [initialData]);

  // Get purchase order items belonging to the selected supplier.
  const availablePOItems = useMemo(() => {
    return purchaseOrders
      .filter(
        (order) =>
          Number(order.supplier_id) === Number(form.supplier_id)
      )
      .flatMap((order) =>
        (order.items || []).map((item) => ({
          ...item,
          order_number: order.order_number,
        }))
      );
  }, [purchaseOrders, form.supplier_id]);

  const getMaterialName = (materialId) => {
    return (
      materials.find(
        (material) => material.id === materialId
      )?.material_name || `Material #${materialId}`
    );
  };

  // Calculate quantities already shipped in other non-cancelled shipments.
  const getAlreadyShipped = (poItemId) => {
    return shipments.reduce((total, shipment) => {
      if (
        shipment.status === "cancelled" ||
        shipment.id === initialData?.id
      ) {
        return total;
      }

      const shipmentItem = shipment.items?.find(
        (item) =>
          item.purchase_order_item_id === Number(poItemId)
      );

      return total + Number(shipmentItem?.shipped_quantity || 0);
    }, 0);
  };

  // Account for quantities already entered in this form.
  const getFormQuantity = (poItemId, currentIndex) => {
    return items.reduce((total, item, index) => {
      if (
        index !== currentIndex &&
        Number(item.purchase_order_item_id) === Number(poItemId)
      ) {
        return total + Number(item.shipped_quantity || 0);
      }

      return total;
    }, 0);
  };

  const getRemainingQuantity = (poItem, currentIndex) => {
    const alreadyShipped = getAlreadyShipped(poItem.id);
    const inCurrentForm = getFormQuantity(
      poItem.id,
      currentIndex
    );

    return (
      Number(poItem.ordered_quantity) -
      alreadyShipped -
      inCurrentForm
    );
  };

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { purchase_order_item_id: "", shipped_quantity: "" },
    ]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSupplierChange = (value) => {
    updateField("supplier_id", value);
    setItems([
      { purchase_order_item_id: "", shipped_quantity: "" },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.supplier_id || !form.warehouse_id) {
      setError("Please select a supplier and warehouse.");
      return;
    }

    if (!isEditing) {
      if (
        items.some(
          (item) =>
            !item.purchase_order_item_id ||
            !item.shipped_quantity ||
            Number(item.shipped_quantity) <= 0
        )
      ) {
        setError("Please provide valid details for every item.");
        return;
      }

      const duplicateIds = items.map(
        (item) => Number(item.purchase_order_item_id)
      );

      if (new Set(duplicateIds).size !== duplicateIds.length) {
        setError("Duplicate purchase order items are not allowed.");
        return;
      }

      for (let index = 0; index < items.length; index++) {
        const item = items[index];

        const poItem = availablePOItems.find(
          (po) =>
            po.id === Number(item.purchase_order_item_id)
        );

        if (!poItem) {
          setError("Please select valid purchase order items.");
          return;
        }

        const remaining = getRemainingQuantity(poItem, index);

        if (Number(item.shipped_quantity) > remaining) {
          setError(
            `Shipped quantity exceeds the remaining quantity for ${getMaterialName(
              poItem.material_id
            )}. Remaining: ${remaining}`
          );
          return;
        }
      }
    }

    const payload = {
      supplier_id: Number(form.supplier_id),
      warehouse_id: Number(form.warehouse_id),
      shipment_number: form.shipment_number.trim(),
      dispatch_date: form.dispatch_date || null,
      expected_arrival_date:
        form.expected_arrival_date || null,
      tracking_number: form.tracking_number.trim() || null,
      notes: form.notes.trim() || null,
    };

    if (!isEditing) {
      payload.items = items.map((item) => ({
        purchase_order_item_id: Number(
          item.purchase_order_item_id
        ),
        shipped_quantity: String(item.shipped_quantity),
      }));
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to save shipment."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Shipment Details */}
      <div>
        <h3 className="mb-4 text-base font-semibold text-gray-900">
          Shipment Details
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Shipment Number *
            </label>
            <input
              required
              value={form.shipment_number}
              onChange={(e) =>
                updateField("shipment_number", e.target.value)
              }
              placeholder="e.g. SH-001"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Supplier *
            </label>
            <select
              required
              value={form.supplier_id}
              disabled={isEditing}
              onChange={(e) =>
                handleSupplierChange(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.supplier_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Destination Warehouse *
            </label>
            <select
              required
              value={form.warehouse_id}
              onChange={(e) =>
                updateField("warehouse_id", e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tracking Number
            </label>
            <input
              value={form.tracking_number}
              onChange={(e) =>
                updateField("tracking_number", e.target.value)
              }
              placeholder="Enter tracking number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Dispatch Date
            </label>
            <input
              type="date"
              value={form.dispatch_date}
              onChange={(e) =>
                updateField("dispatch_date", e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Expected Arrival Date
            </label>
            <input
              type="date"
              value={form.expected_arrival_date}
              onChange={(e) =>
                updateField("expected_arrival_date", e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Purchase Order Items */}
      <div className="border-t border-gray-200 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Shipment Items
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Select purchase order items and enter shipped quantities.
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              <Plus size={16} />
              Add Item
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            {(initialData.items || []).map((item) => (
              <div
                key={item.id}
                className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700"
              >
                <p className="font-medium">
                  Purchase Order Item #{item.purchase_order_item_id}
                </p>
                <p className="mt-1">
                  Shipped Quantity: {item.shipped_quantity}
                </p>
                <p>
                  Received Quantity: {item.received_quantity}
                </p>
              </div>
            ))}
            <p className="text-xs text-gray-500">
              Shipment items cannot be changed while editing.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 items-end gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-[2fr_1fr_auto]"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Purchase Order Item *
                  </label>

                  <select
                    required
                    value={item.purchase_order_item_id}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "purchase_order_item_id",
                        e.target.value
                      )
                    }
                    disabled={!form.supplier_id}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">
                      {form.supplier_id
                        ? "Select purchase order item"
                        : "Select supplier first"}
                    </option>

                    {availablePOItems.map((poItem) => {
                      const remaining = getRemainingQuantity(
                        poItem,
                        index
                      );

                      if (
                        remaining <= 0 &&
                        Number(item.purchase_order_item_id) !==
                          poItem.id
                      ) {
                        return null;
                      }

                      return (
                        <option
                          key={poItem.id}
                          value={poItem.id}
                        >
                          {poItem.order_number} —{" "}
                          {getMaterialName(poItem.material_id)} (
                          {remaining} {poItem.unit} remaining)
                        </option>
                      );
                    })}
                  </select>

                  {item.purchase_order_item_id && (
                    <p className="mt-1 text-xs text-gray-500">
                      Remaining quantity:{" "}
                      {(() => {
                        const poItem = availablePOItems.find(
                          (po) =>
                            po.id ===
                            Number(item.purchase_order_item_id)
                        );

                        return poItem
                          ? `${getRemainingQuantity(
                              poItem,
                              index
                            )} ${poItem.unit}`
                          : "—";
                      })()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Shipped Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.001"
                    step="0.001"
                    value={item.shipped_quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "shipped_quantity",
                        e.target.value
                      )
                    }
                    placeholder="0.000"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Additional shipment information..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Shipment"
              : "Create Shipment"}
        </button>
      </div>
    </form>
  );
}

export default ShipmentForm;
