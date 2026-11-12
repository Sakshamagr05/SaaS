
import {
  Eye,
  Pencil,
  Trash2,
  PackageCheck,
  Package,
} from "lucide-react";

const statusStyles = {
  planned: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  dispatched: "bg-yellow-100 text-yellow-700",
};

function ShipmentTable({
  shipments = [],
  suppliers = [],
  warehouses = [],
  onView,
  onEdit,
  onDelete,
  onReceive,
}) {
  const getSupplierName = (supplierId) => {
    return (
      suppliers.find((supplier) => supplier.id === supplierId)
        ?.supplier_name || "Unknown Supplier"
    );
  };

  const getWarehouseName = (warehouseId) => {
    return (
      warehouses.find((warehouse) => warehouse.id === warehouseId)
        ?.warehouse_name || "Unknown Warehouse"
    );
  };

  if (shipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-gray-500">
        <Package size={40} className="mb-3 text-gray-400" />
        <p className="font-medium">No shipments found</p>
        <p className="mt-1 text-sm">
          Create your first shipment to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[950px] text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-5 py-4 font-semibold">Shipment</th>
            <th className="px-5 py-4 font-semibold">Supplier</th>
            <th className="px-5 py-4 font-semibold">Warehouse</th>
            <th className="px-5 py-4 font-semibold">Items</th>
            <th className="px-5 py-4 font-semibold">Expected Arrival</th>
            <th className="px-5 py-4 font-semibold">Status</th>
            <th className="px-5 py-4 text-right font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {shipments.map((shipment) => {
            const isEditable = ![
              "delivered",
              "cancelled",
            ].includes(shipment.status);

            const canReceive = isEditable;
            const canDelete = shipment.status === "planned";

            return (
              <tr
                key={shipment.id}
                className="transition hover:bg-gray-50"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-gray-900">
                    {shipment.shipment_number}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    ID: {shipment.id}
                  </p>
                </td>

                <td className="px-5 py-4 text-gray-700">
                  {getSupplierName(shipment.supplier_id)}
                </td>

                <td className="px-5 py-4 text-gray-700">
                  {getWarehouseName(shipment.warehouse_id)}
                </td>

                <td className="px-5 py-4 text-gray-700">
                  {shipment.items?.length || 0} items
                </td>

                <td className="px-5 py-4 text-gray-700">
                  {shipment.expected_arrival_date
                    ? new Date(
                        shipment.expected_arrival_date
                      ).toLocaleDateString("en-IN")
                    : "—"}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      statusStyles[shipment.status] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {shipment.status?.replace("_", " ")}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(shipment)}
                      title="View shipment"
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Eye size={17} />
                    </button>

                    {isEditable && (
                      <button
                        onClick={() => onEdit(shipment)}
                        title="Edit shipment"
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil size={17} />
                      </button>
                    )}

                    {canReceive && (
                      <button
                        onClick={() => onReceive(shipment)}
                        title="Receive shipment"
                        className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                      >
                        <PackageCheck size={17} />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => onDelete(shipment)}
                        title="Delete shipment"
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ShipmentTable;
