
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const today = new Date().toISOString().split("T")[0];

const createEmptyItem = () => ({
  material_id: "",
  ordered_quantity: "",
  unit: "",
  unit_price: "",
});

function PurchaseOrderForm({
  suppliers = [],
  materials = [],
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    supplier_id: initialData?.supplier_id?.toString() || "",
    order_number: initialData?.order_number || "",
    order_date: initialData?.order_date || today,
    expected_delivery_date:
      initialData?.expected_delivery_date || "",
    notes: initialData?.notes || "",
  });

  const [items, setItems] = useState(
    initialData?.items?.length
      ? initialData.items.map((item) => ({
          ...item,
          material_id: item.material_id.toString(),
          ordered_quantity: String(item.ordered_quantity),
          unit_price: String(item.unit_price),
        }))
      : [createEmptyItem()]
  );

  const [formError, setFormError] = useState("");

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const updated = { ...item, [field]: value };

        if (field === "material_id") {
          const material = materials.find(
            (m) => m.id === Number(value)
          );

          updated.unit = material?.unit || "";
          updated.unit_price =
            material?.unit_cost != null
              ? String(material.unit_cost)
              : "";
        }

        return updated;
      })
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => {
      return (
        total +
        (Number(item.ordered_quantity) || 0) *
          (Number(item.unit_price) || 0)
      );
    }, 0);
  }, [items]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.supplier_id) {
      setFormError("Please select a supplier.");
      return;
    }

    if (!formData.order_number.trim()) {
      setFormError("Please enter an order number.");
      return;
    }

    if (
      formData.expected_delivery_date &&
      formData.expected_delivery_date < formData.order_date
    ) {
      setFormError(
        "Expected delivery date cannot be before the order date."
      );
      return;
    }

    const payload = {
      supplier_id: Number(formData.supplier_id),
      order_number: formData.order_number.trim(),
      order_date: formData.order_date,
      expected_delivery_date:
        formData.expected_delivery_date || null,
      notes: formData.notes.trim() || null,
    };

    if (!isEditing) {
      if (items.length === 0) {
        setFormError("Add at least one material.");
        return;
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (
          !item.material_id ||
          !item.ordered_quantity ||
          !item.unit ||
          item.unit_price === ""
        ) {
          setFormError(`Please complete all fields in item ${i + 1}.`);
          return;
        }

        if (
          !Number.isFinite(Number(item.ordered_quantity)) ||
          Number(item.ordered_quantity) <= 0
        ) {
          setFormError(`Item ${i + 1}: quantity must be greater than zero.`);
          return;
        }

        if (
          !Number.isFinite(Number(item.unit_price)) ||
          Number(item.unit_price) < 0
        ) {
          setFormError(`Item ${i + 1}: unit price cannot be negative.`);
          return;
        }
      }

      payload.items = items.map((item) => ({
        material_id: Number(item.material_id),
        ordered_quantity: item.ordered_quantity,
        unit: item.unit.trim(),
        unit_price: item.unit_price,
      }));
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      setFormError(
        err.response?.data?.detail || "Failed to save purchase order."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {/* Basic Information */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">
          Order Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Supplier *
            </label>

            <select
              value={formData.supplier_id}
              onChange={(e) =>
                updateField("supplier_id", e.target.value)
              }
              required
              disabled={submitting}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Order Number *
            </label>

            <input
              type="text"
              value={formData.order_number}
              onChange={(e) =>
                updateField("order_number", e.target.value)
              }
              placeholder="e.g. PO-001"
              required
              maxLength={50}
              disabled={submitting}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Order Date *
            </label>

            <input
              type="date"
              value={formData.order_date}
              onChange={(e) =>
                updateField("order_date", e.target.value)
              }
              required
              disabled={submitting}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Expected Delivery Date
            </label>

            <input
              type="date"
              min={formData.order_date}
              value={formData.expected_delivery_date}
              onChange={(e) =>
                updateField("expected_delivery_date", e.target.value)
              }
              disabled={submitting}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Notes
          </label>

          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Additional order information..."
            disabled={submitting}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </section>

      {/* Order Items */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            Order Items
          </h3>

          {!isEditing && (
            <button
              type="button"
              onClick={addItem}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus size={17} />
              Add Item
            </button>
          )}
        </div>

        {isEditing && (
          <p className="text-xs text-gray-500">
            Existing items are read-only. Your current API does not
            support editing order items.
          </p>
        )}

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Item {index + 1}
                </span>

                {!isEditing && items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={submitting}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    title="Remove item"
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Material
                  </label>

                  {isEditing ? (
                    <input
                      value={
                        materials.find(
                          (m) => m.id === Number(item.material_id)
                        )?.material_name ||
                        `Material #${item.material_id}`
                      }
                      readOnly
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                    />
                  ) : (
                    <select
                      value={item.material_id}
                      onChange={(e) =>
                        updateItem(index, "material_id", e.target.value)
                      }
                      required
                      disabled={submitting}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">Select material</option>
                      {materials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.material_name} ({material.sku})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={item.ordered_quantity}
                    onChange={(e) =>
                      updateItem(index, "ordered_quantity", e.target.value)
                    }
                    required
                    readOnly={isEditing}
                    disabled={submitting}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 read-only:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Unit
                  </label>

                  <input
                    value={item.unit}
                    onChange={(e) =>
                      updateItem(index, "unit", e.target.value)
                    }
                    required
                    readOnly={isEditing}
                    disabled={submitting}
                    placeholder="e.g. kg"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 read-only:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Unit Price (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(index, "unit_price", e.target.value)
                    }
                    required
                    readOnly={isEditing}
                    disabled={submitting}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 read-only:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Item Total
                  </label>

                  <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-800">
                    {formatCurrency(
                      (Number(item.ordered_quantity) || 0) *
                        (Number(item.unit_price) || 0)
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Total */}
      <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
        <span className="text-sm font-medium text-gray-700">
          Total Order Amount
        </span>

        <span className="text-xl font-bold text-blue-700">
          {formatCurrency(totalAmount)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Saving..."
            : isEditing
              ? "Update Order"
              : "Create Purchase Order"}
        </button>
      </div>
    </form>
  );
}

export default PurchaseOrderForm;
