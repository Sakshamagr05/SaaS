
import { useEffect, useState } from "react";

const initialFormState = {
  supplier_name: "",
  email: "",
  phone: "",
  address: "",
};

function SupplierForm({
  initialData,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Populate form when editing a supplier
  useEffect(() => {
    if (initialData) {
      setFormData({
        supplier_name: initialData.supplier_name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
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

    if (!formData.supplier_name.trim()) {
      newErrors.supplier_name = "Supplier name is required";
    }

    if (formData.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
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
      supplier_name: formData.supplier_name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      address: formData.address.trim() || null,
    };

    onSubmit(payload);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Supplier Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Supplier Name <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          name="supplier_name"
          value={formData.supplier_name}
          onChange={handleChange}
          placeholder="Enter supplier name"
          maxLength={255}
          className={inputClass}
        />

        {errors.supplier_name && (
          <p className="mt-1 text-xs text-red-500">
            {errors.supplier_name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Email Address
        </label>

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="supplier@example.com"
          className={inputClass}
        />

        {errors.email && (
          <p className="mt-1 text-xs text-red-500">
            {errors.email}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Phone Number
        </label>

        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
          className={inputClass}
        />
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
          placeholder="Enter supplier address"
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Actions */}
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
              ? "Update Supplier"
              : "Add Supplier"}
        </button>
      </div>
    </form>
  );
}

export default SupplierForm;
