
import { X } from "lucide-react";
import WarehouseForm from "./WarehouseForm";

function WarehouseModal({
  warehouse,
  onClose,
  onSubmit,
  submitting = false,
}) {
  const isEditing = Boolean(warehouse);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="warehouse-modal-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="warehouse-modal-title"
              className="text-lg font-semibold text-slate-800"
            >
              {isEditing ? "Edit Warehouse" : "Add New Warehouse"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {isEditing
                ? "Update warehouse information."
                : "Enter the details of your new warehouse."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6">
          <WarehouseForm
            initialData={warehouse}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}

export default WarehouseModal;
