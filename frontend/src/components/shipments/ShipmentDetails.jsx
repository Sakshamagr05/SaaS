
import { X, Package, Truck, Warehouse, CalendarDays } from "lucide-react";

function ShipmentDetails({
  isOpen,
  onClose,
  shipment,
  suppliers = [],
  warehouses = [],
  purchaseOrders = [],
  materials = [],
}) {
  if (!isOpen || !shipment) return null;

  const supplier = suppliers.find(
    (item) => item.id === shipment.supplier_id
  );

  const warehouse = warehouses.find(
    (item) => item.id === shipment.warehouse_id
  );

  const getPOItemDetails = (poItemId) => {
    for (const order of purchaseOrders) {
      const item = order.items?.find(
        (poItem) => poItem.id === poItemId
      );

      if (item) {
        const material = materials.find(
          (material) => material.id === item.material_id
        );

        return {
          orderNumber: order.order_number,
          materialName:
            material?.material_name || `Material #${item.material_id}`,
          unit: item.unit,
        };
      }
    }

    return {
      orderNumber: "—",
      materialName: `PO Item #${poItemId}`,
      unit: "",
    };
  };

  const statusStyles = {
    planned: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    dispatched: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck size={21} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Shipment Details
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {shipment.shipment_number}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">

          {/* Overview */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Shipment Number</p>
              <p className="mt-1 font-semibold text-gray-900">
                {shipment.shipment_number}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Supplier</p>
              <p className="mt-1 font-semibold text-gray-900">
                {supplier?.supplier_name || "Unknown Supplier"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  statusStyles[shipment.status] ||
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {shipment.status?.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Shipment Information */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">
              Shipment Information
            </h3>

            <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">Destination Warehouse</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Warehouse size={16} className="text-gray-400" />
                  {warehouse?.warehouse_name || "Unknown Warehouse"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Tracking Number</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {shipment.tracking_number || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Dispatch Date</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                  <CalendarDays size={16} className="text-gray-400" />
                  {shipment.dispatch_date || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Expected Arrival</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {shipment.expected_arrival_date || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Actual Arrival</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {shipment.actual_arrival_date || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Shipment ID</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  #{shipment.id}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Package size={19} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">
                Shipment Items
              </h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Material</th>
                    <th className="px-4 py-3 font-medium">Purchase Order</th>
                    <th className="px-4 py-3 font-medium">Shipped</th>
                    <th className="px-4 py-3 font-medium">Received</th>
                    <th className="px-4 py-3 font-medium">Pending</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {(shipment.items || []).map((item) => {
                    const details = getPOItemDetails(
                      item.purchase_order_item_id
                    );

                    const shipped = Number(item.shipped_quantity);
                    const received = Number(item.received_quantity);
                    const pending = shipped - received;

                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {details.materialName}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {details.orderNumber}
                        </td>

                        <td className="px-4 py-3 text-gray-700">
                          {shipped} {details.unit}
                        </td>

                        <td className="px-4 py-3 text-green-700">
                          {received} {details.unit}
                        </td>

                        <td className="px-4 py-3 text-orange-600">
                          {pending} {details.unit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {shipment.notes && (
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Notes
              </h3>
              <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                {shipment.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShipmentDetails;
