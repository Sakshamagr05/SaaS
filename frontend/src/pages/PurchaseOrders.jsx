
import { useMemo, useState } from "react";
import {Plus, Search, ShoppingCart, ClipboardList, IndianRupee} from "lucide-react";

import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { useSuppliers } from "../hooks/useSuppliers";
import { useMaterials } from "../hooks/useMaterials";

import PurchaseOrderTable from "../components/purchase-orders/PurchaseOrderTable";
import PurchaseOrderModal from "../components/purchase-orders/PurchaseOrderModal";
import PurchaseOrderDetails from "../components/purchase-orders/PurchaseOrderDetails";

export default function PurchaseOrders() {
  const {
    purchaseOrders,
    loading,
    error,
    addPurchaseOrder,
    editPurchaseOrder,
    removePurchaseOrder,
  } = usePurchaseOrders();

  const { suppliers } = useSuppliers();
  const { materials } = useMaterials();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [viewOrder, setViewOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Search and status filtering
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((order) => {
      const supplierName =
        suppliers.find((s) => s.id === order.supplier_id)
          ?.supplier_name || "";

      const searchTerm = search.toLowerCase();

      const matchesSearch =
        order.order_number?.toLowerCase().includes(searchTerm) ||
        supplierName.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, suppliers, search, statusFilter]);

  // Statistics
  const totalOrders = purchaseOrders.length;

  const activeOrders = purchaseOrders.filter(
    (order) =>
      order.status === "submitted" ||
      order.status === "partially_received"
  ).length;

  const totalValue = purchaseOrders.reduce((sum, order) => {
    const orderTotal = (order.items || []).reduce(
      (itemSum, item) =>
        itemSum +
        Number(item.ordered_quantity) * Number(item.unit_price),
      0
    );

    return sum + orderTotal;
  }, 0);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  // Modal handlers
  const handleAdd = () => {
    setSelectedOrder(null);
    setActionError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setActionError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;

    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Create or update
  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setActionError("");

      if (selectedOrder) {
        await editPurchaseOrder(selectedOrder.id, formData);
        setSuccessMessage("Purchase order updated successfully.");
      } else {
        await addPurchaseOrder(formData);
        setSuccessMessage("Purchase order created successfully.");
      }

      setIsModalOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "Failed to save purchase order.";

      setActionError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (order) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete purchase order "${order.order_number}"?`
    );

    if (!confirmed) return;

    try {
      setActionError("");
      setSuccessMessage("");

      await removePurchaseOrder(order.id);

      setSuccessMessage("Purchase order deleted successfully.");
    } catch (err) {
      setActionError(
        err.response?.data?.detail ||
          "Failed to delete purchase order."
      );
    }
  };

  // View details
  const handleView = (order) => {
    setViewOrder(order);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setViewOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Purchase Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your material purchase orders.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Purchase Order
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
          title="Total Orders"
          value={totalOrders}
          icon={<ShoppingCart size={20} />}
        />

        <StatCard
          title="Active Orders"
          value={activeOrders}
          icon={<ClipboardList size={20} />}
        />

        <StatCard
          title="Total Order Value"
          value={formatCurrency(totalValue)}
          icon={<IndianRupee size={20} />}
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by order number or supplier..."
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
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="partially_received">
            Partially Received
          </option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <PurchaseOrderTable
        purchaseOrders={filteredOrders}
        suppliers={suppliers}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create / Edit Modal */}
      <PurchaseOrderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={selectedOrder}
        suppliers={suppliers}
        materials={materials}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* Details Modal */}
      <PurchaseOrderDetails
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        order={viewOrder}
        suppliers={suppliers}
        materials={materials}
      />
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-xl font-semibold text-gray-900">
          {value}
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
        {icon}
      </div>
    </div>
  );
}
