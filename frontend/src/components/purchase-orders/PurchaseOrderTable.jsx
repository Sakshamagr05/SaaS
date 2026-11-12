
import {
  Eye,
  Pencil,
  Trash2,
  ShoppingCart,
} from "lucide-react";

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

function PurchaseOrderTable({
  purchaseOrders = [],
  suppliers = [],
  loading,
  onView,
  onEdit,
  onDelete,
}) {
  const getSupplierName = (supplierId) => {
    return (
      suppliers.find((supplier) => supplier.id === supplierId)
        ?.supplier_name || `Supplier #${supplierId}`
    );
  };

  const calculateTotal = (items = []) => {
    return items.reduce((total, item) => {
      return (
        total +
        Number(item.ordered_quantity) * Number(item.unit_price)
      );
    }, 0);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
        Loading purchase orders...
      </div>
    );
  }

  if (purchaseOrders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <ShoppingCart
          size={40}
          className="mx-auto mb-3 text-gray-300"
        />
        <h3 className="font-semibold text-gray-800">
          No purchase orders found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Create your first purchase order to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[950px] text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-5 py-4">Order Number</th>
            <th className="px-5 py-4">Supplier</th>
            <th className="px-5 py-4">Order Date</th>
            <th className="px-5 py-4">Expected Delivery</th>
            <th className="px-5 py-4">Items</th>
            <th className="px-5 py-4">Total Amount</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {purchaseOrders.map((order) => (
            <tr
              key={order.id}
              className="transition hover:bg-gray-50"
            >
              <td className="px-5 py-4 font-medium text-gray-900">
                {order.order_number}
              </td>

              <td className="px-5 py-4 text-gray-700">
                {getSupplierName(order.supplier_id)}
              </td>

              <td className="px-5 py-4 text-gray-600">
                {order.order_date || "-"}
              </td>

              <td className="px-5 py-4 text-gray-600">
                {order.expected_delivery_date || "-"}
              </td>

              <td className="px-5 py-4 text-gray-600">
                {order.items?.length || 0}
              </td>

              <td className="px-5 py-4 font-medium text-gray-900">
                {formatCurrency(calculateTotal(order.items))}
              </td>

              <td className="px-5 py-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    statusStyles[order.status] ||
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {formatStatus(order.status)}
                </span>
              </td>

              <td className="px-5 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onView?.(order)}
                    title="View order"
                    className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Eye size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit?.(order)}
                    title="Edit order"
                    className="rounded-lg p-2 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete?.(order)}
                    title="Delete order"
                    className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PurchaseOrderTable;
