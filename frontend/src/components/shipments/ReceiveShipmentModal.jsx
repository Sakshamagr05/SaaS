
import { useEffect, useState } from "react";
import { X, PackageCheck } from "lucide-react";

function ReceiveShipmentModal({
  isOpen,
  onClose,
  onSubmit,
  shipment,
  loading = false,
}) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && shipment) {
      setItems(
        (shipment.items || []).map((item) => ({
          shipment_item_id: item.id,
          shipped_quantity: item.shipped_quantity,
          received_quantity: "",
        }))
      );

      setError("");
    }
  }, [isOpen, shipment]);

  if (!isOpen || !shipment) return null;

  const updateReceivedQuantity = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, received_quantity: value }
          : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    for (const item of items) {
      if (
        item.received_quantity === "" ||
        Number(item.received_quantity) < 0
      ) {
        setError(
          "Enter a valid received quantity for every item. Use 0 if nothing was received."
        );
        return;
      }

      if (
        Number(item.received_quantity) >
        Number(item.shipped_quantity)
      ) {
        setError(
          "Received quantity cannot exceed shipped quantity."
        );
        return;
      }
    }

    const payload = {
      items: items.map((item) => ({
        shipment_item_id: item.shipment_item_id,
        received_quantity: String(item.received_quantity),
      })),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to receive shipment."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <PackageCheck className="text-green-600" size={21} />
              <h2 className="text-lg font-semibold text-gray-900">
                Receive Shipment
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Shipment: {shipment.shipment_number}
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
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="space-y-4 p-6">
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              Enter the actual quantity received at the warehouse.
              The received quantities will be added to inventory.
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {items.map((item, index) => (
              <div
                key={item.shipment_item_id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium text-gray-900">
                    Shipment Item #{item.shipment_item_id}
                  </p>

                  <span className="text-xs text-gray-500">
                    Shipped: {item.shipped_quantity}
                  </span>
                </div>

                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Received Quantity *
                </label>

                <input
                  type="number"
                  min="0"
                  max={item.shipped_quantity}
                  step="0.001"
                  required
                  value={item.received_quantity}
                  onChange={(e) =>
                    updateReceivedQuantity(index, e.target.value)
                  }
                  placeholder="Enter received quantity"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Maximum allowed: {item.shipped_quantity}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
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
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PackageCheck size={17} />
              {loading ? "Receiving..." : "Confirm Receipt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReceiveShipmentModal;
