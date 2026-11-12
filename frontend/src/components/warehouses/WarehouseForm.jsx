
import { useEffect, useState } from "react";

const initialFormState = {
  warehouse_name: "",
  warehouse_code: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  is_active: true,
};

function WarehouseForm({
  initialData,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        warehouse_name: initialData.warehouse_name || "",
        warehouse_code: initialData.warehouse_code || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        pincode: initialData.pincode || "",
        is_active: initialData.is_active ?? true,
      });
    } else {
      setFormData(initialFormState);
    }

    setErrors({});
  }, [initialData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.warehouse_name.trim()) {
      newErrors.warehouse_name = "Warehouse name is required";
    }

    if (!formData.warehouse_code.trim()) {
      newErrors.warehouse_code = "Warehouse code is required";
    }

    if (
      formData.pincode.trim() &&
      !/^\d{6}$/.test(formData.pincode.trim())
    ) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      warehouse_name: formData.warehouse_name.trim(),
      warehouse_code: formData.warehouse_code.trim(),
      address: formData.address.trim() || null,
      city: formData.city.trim() || null,
      state: formData.state.trim() || null,
      pincode: formData.pincode.trim() || null,
      is_active: formData.is_active,
    };

    onSubmit(payload);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Warehouse Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Warehouse Name <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          name="warehouse_name"
          value={formData.warehouse_name}
          onChange={handleChange}
          placeholder="e.g. Main Warehouse"
          maxLength={255}
          className={inputClass}
        />

        {errors.warehouse_name && (
          <p className="mt-1 text-xs text-red-500">
            {errors.warehouse_name}
          </p>
        )}
      </div>

      {/* Warehouse Code */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Warehouse Code <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          name="warehouse_code"
          value={formData.warehouse_code}
          onChange={handleChange}
          placeholder="e.g. WH-001"
          maxLength={50}
          className={inputClass}
        />

        {errors.warehouse_code && (
          <p className="mt-1 text-xs text-red-500">
            {errors.warehouse_code}
          </p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Address
        </label>

        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter warehouse address"
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* City and State */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            City
          </label>

          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter city"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            State
          </label>

          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter state"
            className={inputClass}
          />
        </div>
      </div>

      {/* Pincode */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Pincode
        </label>

        <input
          type="text"
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
          placeholder="6-digit pincode"
          maxLength={6}
          inputMode="numeric"
          className={inputClass}
        />

        {errors.pincode && (
          <p className="mt-1 text-xs text-red-500">
            {errors.pincode}
          </p>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
        <div>
          <p className="text-sm font-medium text-slate-700">
            Warehouse Status
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Enable or disable this warehouse.
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_active: e.target.checked,
              }))
            }
            className="h-4 w-4 accent-blue-600"
          />

          <span className="text-sm font-medium text-slate-700">
            {formData.is_active ? "Active" : "Inactive"}
          </span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
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
            : initialData
              ? "Update Warehouse"
              : "Add Warehouse"}
        </button>
      </div>
    </form>
  );
}

export default WarehouseForm;
