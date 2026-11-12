
import { X, ShoppingCart } from "lucide-react";

const statusStyles = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-700",
  partially_received: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function formatStatus(status) {
  return status
    ?.replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function PurchaseOrderDetails({
  isOpen,
  onClose,
  order,
  suppliers = [],
  materials = [],
}) {
  if (!isOpen || !order) return null;

  const supplier = suppliers.find(
    (s) => s.id === order.supplier_id
  );

  const getMaterialName = (materialId) => {
    const material = materials.find(
      (m) => m.id === materialId
    );

    return material?.material_name || `Material #${materialId}`;
  };

  const totalAmount = (order.items || []).reduce(
    (total, item) =>
      total +
      Number(item.ordered_quantity) * Number(item.unit_price),
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-order-details-title"
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-blue-600" />

              <h2
                id="purchase-order-details-title"
                className="text-lg font-semibold text-gray-900"
              >
                Purchase Order Details
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {order.order_number}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
          {/* Order Information */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Order Information
            </h3>

            <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
              <Info
                label="Order Number"
                value={order.order_number}
              />

              <Info
                label="Supplier"
                value={supplier?.supplier_name || `Supplier #${order.supplier_id}`}
              />

              <Info
                label="Order Date"
                value={order.order_date}
              />

              <Info
                label="Expected Delivery"
                value={order.expected_delivery_date || "-"}
              />

              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    statusStyles[order.status] ||
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {formatStatus(order.status)}
                </span>
              </div>
            </div>
          </section>

          {/* Items */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Order Items ({order.items?.length || 0})
            </h3>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Material</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Unit Price</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {(order.items || []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {getMaterialName(item.material_id)}
                      </td>

                      <td className="px-4 py-3">
                        {item.ordered_quantity}
                      </td>

                      <td className="px-4 py-3">{item.unit}</td>

                      <td className="px-4 py-3">
                        {formatCurrency(Number(item.unit_price))}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(
                          Number(item.ordered_quantity) *
                            Number(item.unit_price)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Total */}
          <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
            <span className="font-medium text-gray-700">
              Total Order Amount
            </span>

            <span className="text-xl font-bold text-blue-700">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          {/* Notes */}
          {order.notes && (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Notes
              </h3>

              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                {order.notes}
              </p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-800">
        {value || "-"}
      </p>
    </div>
  );
}

export default PurchaseOrderDetails;
