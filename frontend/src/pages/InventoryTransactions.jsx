
import {
  History,
  RefreshCw,
  ArrowDownCircle,
  ArrowUpCircle,
  Layers,
} from "lucide-react";

import { useInventoryTransactions } from "../hooks/useInventoryTransactions";
import { useMaterials } from "../hooks/useMaterials";
import { useWarehouses } from "../hooks/useWarehouses";

import InventoryTransactionTable from "../components/inventory/InventoryTransactionTable";

function InventoryTransactions() {
  const {
    transactions,
    loading,
    error,
    filters,
    setFilters,
    page,
    setPage,
    hasNextPage,
    fetchTransactions,
  } = useInventoryTransactions();

  const { materials = [] } = useMaterials();
  const { warehouses = [] } = useWarehouses();

  const totalIncreases = transactions.filter(
    (item) => Number(item.quantity_change) > 0
  ).length;

  const totalDecreases = transactions.filter(
    (item) => Number(item.quantity_change) < 0
  ).length;

  const handleWarehouseChange = (value) => {
    setFilters({
      ...filters,
      warehouse_id: value,
    });
  };

  const handleMaterialChange = (value) => {
    setFilters({
      ...filters,
      material_id: value,
    });
  };

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <History size={25} className="text-blue-600" />

            <h1 className="text-2xl font-bold text-gray-900">
              Inventory Transactions
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Track every stock movement across your warehouses.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Transactions on This Page
            </p>
            <Layers size={20} className="text-blue-600" />
          </div>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {transactions.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Stock In Transactions
            </p>
            <ArrowUpCircle size={20} className="text-green-600" />
          </div>

          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {totalIncreases}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Stock Out Transactions
            </p>
            <ArrowDownCircle size={20} className="text-red-600" />
          </div>

          <h2 className="mt-2 text-2xl font-bold text-red-600">
            {totalDecreases}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-end">

        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Warehouse
          </label>

          <select
            value={filters.warehouse_id}
            onChange={(e) =>
              handleWarehouseChange(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Warehouses</option>

            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.warehouse_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Material
          </label>

          <select
            value={filters.material_id}
            onChange={(e) =>
              handleMaterialChange(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Materials</option>

            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.material_name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() =>
            setFilters({
              warehouse_id: "",
              material_id: "",
            })
          }
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Transactions */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-500">
          Loading transactions...
        </div>
      ) : (
        <InventoryTransactionTable
          transactions={transactions}
          materials={materials}
          warehouses={warehouses}
        />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
        <p className="text-sm text-gray-500">
          Page {page + 1}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0 || loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!hasNextPage || loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default InventoryTransactions;
