
import { useMemo, useState } from "react";
import { Plus, Search, Users, RefreshCw } from "lucide-react";

import { useSuppliers } from "../hooks/useSuppliers";
import SupplierTable from "../components/suppliers/SupplierTable";
import SupplierModal from "../components/suppliers/SupplierModal";

function Suppliers() {
  const {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    addSupplier,
    editSupplier,
    removeSupplier,
  } = useSuppliers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Search suppliers
  const filteredSuppliers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return suppliers;

    return suppliers.filter((supplier) =>
      [
        supplier.supplier_name,
        supplier.email,
        supplier.phone,
      ].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [suppliers, searchTerm]);

  // Open Add modal
  const handleAdd = () => {
    setSelectedSupplier(null);
    setActionError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setActionError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  // Close modal
  const handleClose = () => {
    if (submitting) return;

    setIsModalOpen(false);
    setSelectedSupplier(null);
    setActionError("");
  };

  // Add or Update supplier
  const handleSubmit = async (supplierData) => {
    try {
      setSubmitting(true);
      setActionError("");

      if (selectedSupplier) {
        await editSupplier(selectedSupplier.id, supplierData);
        setSuccessMessage("Supplier updated successfully.");
      } else {
        await addSupplier(supplierData);
        setSuccessMessage("Supplier added successfully.");
      }

      setIsModalOpen(false);
      setSelectedSupplier(null);
    } catch (err) {
      setActionError(
        err.response?.data?.detail || "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete supplier
  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${supplier.supplier_name}?`
    );

    if (!confirmed) return;

    try {
      setActionError("");
      setSuccessMessage("");

      await removeSupplier(supplier.id);

      setSuccessMessage("Supplier deleted successfully.");
    } catch (err) {
      setActionError(
        err.response?.data?.detail || "Failed to delete supplier."
      );
    }
  };

  return (
    <div className="space-y-7">

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Suppliers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and organize your supplier network.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Supplier Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Suppliers
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {suppliers.length}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Matching Suppliers
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {filteredSuppliers.length}
              </h2>
            </div>

            <div className="rounded-xl bg-purple-50 p-3">
              <Search size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Directory */}
      <div className="space-y-4">

        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Supplier Directory
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View and manage all registered suppliers.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-16">
            <RefreshCw size={20} className="animate-spin text-blue-600" />
            <span className="ml-3 text-sm text-slate-500">
              Loading suppliers...
            </span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={fetchSuppliers}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <SupplierTable
            suppliers={filteredSuppliers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Add / Edit Modal */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={handleClose}
        initialData={selectedSupplier}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

    </div>
  );
}

export default Suppliers;
