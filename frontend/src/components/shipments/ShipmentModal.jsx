
import { X } from "lucide-react";
import ShipmentForm from "./ShipmentForm";

function ShipmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  suppliers = [],
  warehouses = [],
  purchaseOrders = [],
  materials = [],
  shipments = [],
  loading = false,
}) {
  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? "Edit Shipment" : "Create Shipment"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing
                ? "Update shipment information."
                : "Create a shipment against purchase order items."}
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
        <div className="overflow-y-auto p-6">
          <ShipmentForm
            initialData={initialData}
            suppliers={suppliers}
            warehouses={warehouses}
            purchaseOrders={purchaseOrders}
            materials={materials}
            shipments={shipments}
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default ShipmentModal;
