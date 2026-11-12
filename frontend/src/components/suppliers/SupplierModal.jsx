
import { X } from "lucide-react";
import SupplierForm from "./SupplierForm";

function SupplierModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

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
        aria-labelledby="supplier-modal-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="supplier-modal-title"
              className="text-lg font-semibold text-slate-800"
            >
              {isEditing ? "Edit Supplier" : "Add New Supplier"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {isEditing
                ? "Update supplier information."
                : "Enter the details of your new supplier."}
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

        {/* Modal Body */}
        <div className="p-6">
          <SupplierForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}

export default SupplierModal;
