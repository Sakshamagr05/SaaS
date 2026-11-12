
import { useEffect, useState } from "react";

const initialFormState = {
  material_name: "",
  sku: "",
  unit: "pcs",
  unit_cost: "0.00",
};

const units = [
  "pcs",
  "kg",
  "gram",
  "litre",
  "metre",
  "box",
  "ton",
];

function MaterialForm({
  initialData,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        material_name: initialData.material_name || "",
        sku: initialData.sku || "",
        unit: initialData.unit || "pcs",
        unit_cost: String(initialData.unit_cost ?? "0.00"),
      });
    } else {
      setFormData(initialFormState);
    }

    setErrors({});
  }, [initialData]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.material_name.trim()) {
      newErrors.material_name = "Material name is required";
    }

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (!formData.unit.trim()) {
      newErrors.unit = "Unit is required";
    }

    const cost = formData.unit_cost.trim();

    if (!/^\d+(\.\d{1,2})?$/.test(cost)) {
      newErrors.unit_cost =
        "Enter a valid cost with up to 2 decimal places";
    } else if (Number(cost) < 0) {
      newErrors.unit_cost = "Cost cannot be negative";
    } else if (!Number.isFinite(Number(cost))) {
      newErrors.unit_cost = "Enter a valid cost";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      material_name: formData.material_name.trim(),
      sku: formData.sku.trim(),
      unit: formData.unit.trim(),
      unit_cost: formData.unit_cost.trim(),
    };

    onSubmit(payload);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Material Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Material Name <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          name="material_name"
          value={formData.material_name}
          onChange={handleChange}
          placeholder="e.g. Mild Steel Sheet"
          maxLength={255}
          className={inputClass}
        />

        {errors.material_name && (
          <p className="mt-1 text-xs text-red-500">
            {errors.material_name}
          </p>
        )}
      </div>

      {/* SKU */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          SKU <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="e.g. MS-001"
          maxLength={100}
          className={inputClass}
        />

        {errors.sku && (
          <p className="mt-1 text-xs text-red-500">
            {errors.sku}
          </p>
        )}
      </div>

      {/* Unit */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Unit of Measurement <span className="text-red-500">*</span>
        </label>

        <input
          list="material-units"
          type="text"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          placeholder="Select or enter unit"
          maxLength={30}
          className={inputClass}
        />

        <datalist id="material-units">
          {units.map((unit) => (
            <option key={unit} value={unit} />
          ))}
        </datalist>

        {errors.unit && (
          <p className="mt-1 text-xs text-red-500">
            {errors.unit}
          </p>
        )}
      </div>

      {/* Unit Cost */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Unit Cost (₹) <span className="text-red-500">*</span>
        </label>

        <input
          type="number"
          name="unit_cost"
          value={formData.unit_cost}
          onChange={handleChange}
          placeholder="0.00"
          min="0"
          step="0.01"
          className={inputClass}
        />

        {errors.unit_cost && (
          <p className="mt-1 text-xs text-red-500">
            {errors.unit_cost}
          </p>
        )}
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
              ? "Update Material"
              : "Add Material"}
        </button>
      </div>
    </form>
  );
}

export default MaterialForm;
