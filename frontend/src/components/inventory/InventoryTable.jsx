
import { useMemo, useState } from "react";
import {
  Search,
  Package,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";

function InventoryTable({
  inventory = [],
  materials = [],
  warehouses = [],
  onAdjust,
}) {
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const getMaterial = (materialId) =>
    materials.find((item) => item.id === materialId);

  const getWarehouse = (warehouseId) =>
    warehouses.find((item) => item.id === warehouseId);

  const filteredInventory = useMemo(() => {
    let result = inventory.filter((item) => {
      const material = getMaterial(item.material_id);
      const warehouse = getWarehouse(item.warehouse_id);

      const matchesSearch =
        material?.material_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        material?.sku
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        warehouse?.warehouse_name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesWarehouse =
        warehouseFilter === "all" ||
        String(item.warehouse_id) === warehouseFilter;

      return matchesSearch && matchesWarehouse;
    });

    result.sort((a, b) => {
      if (sortOrder === "newest") return b.id - a.id;
      if (sortOrder === "oldest") return a.id - b.id;

      return (
        Number(b.quantity_on_hand) -
        Number(a.quantity_on_hand)
      );
    });

    return result;
  }, [
    inventory,
    materials,
    warehouses,
    search,
    warehouseFilter,
    sortOrder,
  ]);

  if (inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-gray-500">
        <Package size={40} className="mb-3 text-gray-400" />
        <p className="font-medium">No inventory available</p>
        <p className="mt-1 text-sm">
          Stock will appear here after receiving shipments or adjusting inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Filters */}
      <div className="flex flex-col gap-3 border-b border-gray-200 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search material, SKU or warehouse..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <SlidersHorizontal
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">All Warehouses</option>

              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.warehouse_name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="quantity">Highest Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-4 font-semibold">Material</th>
              <th className="px-5 py-4 font-semibold">SKU</th>
              <th className="px-5 py-4 font-semibold">Warehouse</th>
              <th className="px-5 py-4 font-semibold">Quantity On Hand</th>
              <th className="px-5 py-4 text-right font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredInventory.map((item) => {
              const material = getMaterial(item.material_id);
              const warehouse = getWarehouse(item.warehouse_id);

              return (
                <tr
                  key={item.id}
                  className="transition hover:bg-gray-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">
                      {material?.material_name ||
                        `Material #${item.material_id}`}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {material?.sku || "—"}
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    {warehouse?.warehouse_name ||
                      `Warehouse #${item.warehouse_id}`}
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-semibold text-gray-900">
                      {Number(item.quantity_on_hand).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 3,
                          maximumFractionDigits: 3,
                        }
                      )}
                    </span>

                    <span className="ml-1 text-xs text-gray-500">
                      {material?.unit || ""}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => onAdjust(item)}
                      className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty filter result */}
      {filteredInventory.length === 0 && (
        <div className="py-10 text-center text-sm text-gray-500">
          No inventory records match your search.
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 px-5 py-3 text-xs text-gray-500">
        Showing {filteredInventory.length} of {inventory.length} records
      </div>
    </div>
  );
}

export default InventoryTable;
