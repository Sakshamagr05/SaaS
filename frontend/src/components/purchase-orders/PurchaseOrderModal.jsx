
import { X } from "lucide-react";
import PurchaseOrderForm from "./PurchaseOrderForm";

function PurchaseOrderModal({
  isOpen,
  onClose,
  initialData = null,
  suppliers = [],
  materials = [],
  onSubmit,
  submitting = false,
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
        aria-labelledby="purchase-order-modal-title"
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              id="purchase-order-modal-title"
              className="text-lg font-semibold text-slate-800"
            >
              {isEditing ? "Edit Purchase Order" : "Create Purchase Order"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {isEditing
                ? "Update purchase order information."
                : "Create an order and add the required materials."}
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

        {/* Form */}
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <PurchaseOrderForm
            initialData={initialData}
            suppliers={suppliers}
            materials={materials}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}

export default PurchaseOrderModal;
