
import { useMemo, useState } from "react";
import { Plus, Search, Package, RefreshCw } from "lucide-react";

import { useMaterials } from "../hooks/useMaterials";
import MaterialTable from "../components/materials/MaterialTable";
import MaterialModal from "../components/materials/MaterialModal";

function Materials() {
  const {
    materials,
    loading,
    error,
    fetchMaterials,
    addMaterial,
    editMaterial,
    removeMaterial,
  } = useMaterials();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Search materials
  const filteredMaterials = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return materials;

    return materials.filter((material) =>
      [
        material.material_name,
        material.sku,
        material.unit,
      ].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [materials, searchTerm]);

  // Open Add modal
  const handleAdd = () => {
    setSelectedMaterial(null);
    setActionError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleEdit = (material) => {
    setSelectedMaterial(material);
    setActionError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  // Close modal
  const handleClose = () => {
    if (submitting) return;

    setIsModalOpen(false);
    setSelectedMaterial(null);
    setActionError("");
  };

  // Add or Update material
  const handleSubmit = async (materialData) => {
    try {
      setSubmitting(true);
      setActionError("");

      if (selectedMaterial) {
        await editMaterial(selectedMaterial.id, materialData);
        setSuccessMessage("Material updated successfully.");
      } else {
        await addMaterial(materialData);
        setSuccessMessage("Material added successfully.");
      }

      setIsModalOpen(false);
      setSelectedMaterial(null);
    } catch (err) {
      setActionError(
        err.response?.data?.detail || "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete material
  const handleDelete = async (material) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${material.material_name}?`
    );

    if (!confirmed) return;

    try {
      setActionError("");
      setSuccessMessage("");

      await removeMaterial(material.id);

      setSuccessMessage("Material deleted successfully.");
    } catch (err) {
      setActionError(
        err.response?.data?.detail || "Failed to delete material."
      );
    }
  };

  return (
    <div className="space-y-7">

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Materials
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your raw materials and their pricing.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Material
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Materials
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {materials.length}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Matching Materials
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {filteredMaterials.length}
              </h2>
            </div>

            <div className="rounded-xl bg-purple-50 p-3">
              <Search size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Material Directory */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Material Directory
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View and manage all registered materials.
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
            placeholder="Search by name, SKU or unit..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Loading / Error / Table */}
        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-16">
            <RefreshCw
              size={20}
              className="animate-spin text-blue-600"
            />

            <span className="ml-3 text-sm text-slate-500">
              Loading materials...
            </span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={fetchMaterials}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <MaterialTable
            materials={filteredMaterials}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Add / Edit Modal */}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={handleClose}
        initialData={selectedMaterial}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

    </div>
  );
}

export default Materials;
