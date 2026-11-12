
import {
  ArrowDownCircle,
  ArrowUpCircle,
  History,
} from "lucide-react";

function InventoryTransactionTable({
  transactions = [],
  materials = [],
  warehouses = [],
}) {
  const getMaterial = (materialId) =>
    materials.find((item) => item.id === materialId);

  const getWarehouse = (warehouseId) =>
    warehouses.find((item) => item.id === warehouseId);

  const transactionStyles = {
    purchase_receipt: "bg-green-100 text-green-700",
    adjustment_increase: "bg-blue-100 text-blue-700",
    adjustment_decrease: "bg-red-100 text-red-700",
  };

  const formatTransactionType = (type) => {
    return type
      ?.split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-gray-500">
        <History size={40} className="mb-3 text-gray-400" />

        <p className="font-medium">
          No transactions found
        </p>

        <p className="mt-1 text-sm">
          Stock movements will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-4 font-semibold">
                Transaction
              </th>

              <th className="px-5 py-4 font-semibold">
                Material
              </th>

              <th className="px-5 py-4 font-semibold">
                Warehouse
              </th>

              <th className="px-5 py-4 font-semibold">
                Type
              </th>

              <th className="px-5 py-4 font-semibold">
                Quantity Change
              </th>

              <th className="px-5 py-4 font-semibold">
                Reference
              </th>

              <th className="px-5 py-4 font-semibold">
                Date
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {transactions.map((transaction) => {
              const material = getMaterial(
                transaction.material_id
              );

              const warehouse = getWarehouse(
                transaction.warehouse_id
              );

              const quantity = Number(
                transaction.quantity_change
              );

              const isIncrease = quantity > 0;

              return (
                <tr
                  key={transaction.id}
                  className="transition hover:bg-gray-50"
                >
                  {/* Transaction ID */}
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">
                      #{transaction.id}
                    </p>
                  </td>

                  {/* Material */}
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">
                      {material?.material_name ||
                        `Material #${transaction.material_id}`}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {material?.sku || "—"}
                    </p>
                  </td>

                  {/* Warehouse */}
                  <td className="px-5 py-4 text-gray-700">
                    {warehouse?.warehouse_name ||
                      `Warehouse #${transaction.warehouse_id}`}
                  </td>

                  {/* Transaction Type */}
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        transactionStyles[
                          transaction.transaction_type
                        ] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {formatTransactionType(
                        transaction.transaction_type
                      )}
                    </span>
                  </td>

                  {/* Quantity */}
                  <td className="px-5 py-4">
                    <div
                      className={`flex items-center gap-2 font-semibold ${
                        isIncrease
                          ? "text-green-600"
                          : quantity < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      }`}
                    >
                      {isIncrease ? (
                        <ArrowUpCircle size={17} />
                      ) : quantity < 0 ? (
                        <ArrowDownCircle size={17} />
                      ) : null}

                      {isIncrease ? "+" : ""}
                      {quantity.toFixed(3)}
                      <span className="text-xs font-normal text-gray-500">
                        {material?.unit || ""}
                      </span>
                    </div>
                  </td>

                  {/* Reference */}
                  <td className="px-5 py-4 text-gray-600">
                    {transaction.shipment_item_id
                      ? `Shipment Item #${transaction.shipment_item_id}`
                      : "Manual Adjustment"}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 text-gray-600">
                    {formatDate(transaction.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transaction Notes */}
      <div className="border-t border-gray-200">
        {transactions.some((item) => item.notes) && (
          <div className="divide-y divide-gray-100">
            {transactions
              .filter((item) => item.notes)
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="px-5 py-3 text-xs text-gray-500"
                >
                  <span className="font-medium text-gray-700">
                    Transaction #{transaction.id}:
                  </span>{" "}
                  {transaction.notes}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryTransactionTable;
