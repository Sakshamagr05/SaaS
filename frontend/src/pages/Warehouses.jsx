import { useMemo, useState } from "react";
import { Plus, Search, Warehouse as WarehouseIcon } from "lucide-react";

import { useWarehouses } from "../hooks/useWarehouses";
import WarehouseTable from "../components/warehouses/WarehouseTable";
import WarehouseModal from "../components/warehouses/WarehouseModal";

export default function Warehouses() {
  const {
    warehouses,
    loading,
    error,
    addWarehouse,
    editWarehouse,
    removeWarehouse,
  } = useWarehouses();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((warehouse) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch = [
        warehouse.warehouse_name,
        warehouse.warehouse_code,
        warehouse.city,
        warehouse.state,
      ].some((value) => value?.toLowerCase().includes(searchTerm));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && warehouse.is_active) ||
        (statusFilter === "inactive" && !warehouse.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [warehouses, search, statusFilter]);

  const activeCount = warehouses.filter((w) => w.is_active).length;
  const inactiveCount = warehouses.length - activeCount;

  const handleAdd = () => {
    setSelectedWarehouse(null);
    setActionError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const handleEdit = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setActionError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setActionError("");

      if (selectedWarehouse) {
        await editWarehouse(selectedWarehouse.id, formData);
        setSuccessMessage("Warehouse updated successfully.");
      } else {
        await addWarehouse(formData);
        setSuccessMessage("Warehouse created successfully.");
      }

      setIsModalOpen(false);
      setSelectedWarehouse(null);
    } catch (err) {
      setActionError(
        err.response?.data?.detail || "Something went wrong."
      );
    }
  };

  const handleDelete = async (warehouse) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${warehouse.warehouse_name}"?`
    );

    if (!confirmed) return;

    try {
      setActionError("");
      setSuccessMessage("");
      await removeWarehouse(warehouse.id);
      setSuccessMessage("Warehouse deleted successfully.");
    } catch (err) {
      setActionError(
        err.response?.data?.detail || "Failed to delete warehouse."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your business storage locations.
          </p>
        </div>

              <button
                  onClick={() => {
                      console.log("Add Warehouse clicked");
                      handleAdd();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                  <Plus size={18} />
                  Add Warehouse
              </button>
      </div>

      {/* Feedback */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {actionError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Warehouses"
          value={warehouses.length}
          icon={<WarehouseIcon size={20} />}
        />
        <StatCard
          title="Active"
          value={activeCount}
          icon={<WarehouseIcon size={20} />}
        />
        <StatCard
          title="Inactive"
          value={inactiveCount}
          icon={<WarehouseIcon size={20} />}
        />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, code, city or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All Warehouses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <WarehouseTable
        warehouses={filteredWarehouses}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      {isModalOpen && (
        <WarehouseModal
          warehouse={selectedWarehouse}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedWarehouse(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      <div className="rounded-lg bg-blue-50 p-3 text-blue-600">{icon}</div>
    </div>
  );
}