
import { useState } from "react";
import { Plus, Truck, RefreshCw } from "lucide-react";

import { useShipments } from "../hooks/useShipments";
import { useSuppliers } from "../hooks/useSuppliers";
import { useWarehouses } from "../hooks/useWarehouses";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { useMaterials } from "../hooks/useMaterials";

import ShipmentTable from "../components/shipments/ShipmentTable";
import ShipmentModal from "../components/shipments/ShipmentModal";
import ReceiveShipmentModal from "../components/shipments/ReceiveShipmentModal";
import ShipmentDetails from "../components/shipments/ShipmentDetails";

function Shipments() {
  const {
    shipments,
    loading,
    error,
    fetchShipments,
    addShipment,
    editShipment,
    removeShipment,
    receiveShipment,
  } = useShipments();

  const { suppliers = [] } = useSuppliers();
  const { warehouses = [] } = useWarehouses();
  const { purchaseOrders = [] } = usePurchaseOrders();
  const { materials = [] } = useMaterials();

  const [isShipmentModalOpen, setIsShipmentModalOpen] =
    useState(false);

  const [isReceiveModalOpen, setIsReceiveModalOpen] =
    useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedShipment, setSelectedShipment] = useState(null);

  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");

  // Open create modal
  const handleCreate = () => {
    setSelectedShipment(null);
    setPageError("");
    setIsShipmentModalOpen(true);
  };

  // Open edit modal
  const handleEdit = (shipment) => {
    setSelectedShipment(shipment);
    setPageError("");
    setIsShipmentModalOpen(true);
  };

  // Create or update shipment
  const handleShipmentSubmit = async (data) => {
    try {
      setSaving(true);
      setPageError("");

      if (selectedShipment) {
        await editShipment(selectedShipment.id, data);
      } else {
        await addShipment(data);
      }

      setIsShipmentModalOpen(false);
      setSelectedShipment(null);
    } catch (err) {
      setPageError(
        err.response?.data?.detail || "Failed to save shipment."
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Open shipment details
  const handleView = (shipment) => {
    setSelectedShipment(shipment);
    setIsDetailsOpen(true);
  };

  // Open receiving modal
  const handleReceiveOpen = (shipment) => {
    setSelectedShipment(shipment);
    setIsReceiveModalOpen(true);
  };

  // Receive shipment
  const handleReceiveSubmit = async (data) => {
    try {
      setSaving(true);
      setPageError("");

      await receiveShipment(selectedShipment.id, data);

      setIsReceiveModalOpen(false);
      setSelectedShipment(null);
    } catch (err) {
      setPageError(
        err.response?.data?.detail || "Failed to receive shipment."
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Delete shipment
  const handleDelete = async (shipment) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete shipment ${shipment.shipment_number}?`
    );

    if (!confirmed) return;

    try {
      setPageError("");
      await removeShipment(shipment.id);
    } catch (err) {
      setPageError(
        err.response?.data?.detail || "Failed to delete shipment."
      );
    }
  };

  const closeShipmentModal = () => {
    setIsShipmentModalOpen(false);
    setSelectedShipment(null);
  };

  const closeReceiveModal = () => {
    setIsReceiveModalOpen(false);
    setSelectedShipment(null);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedShipment(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Truck size={25} className="text-blue-600" />

            <h1 className="text-2xl font-bold text-gray-900">
              Shipments
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Track incoming shipments and manage warehouse receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchShipments}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Shipment
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Shipments</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {shipments.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Planned Shipments</p>
          <h2 className="mt-2 text-2xl font-bold text-blue-600">
            {shipments.filter((s) => s.status === "planned").length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Delivered Shipments</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {shipments.filter((s) => s.status === "delivered").length}
          </h2>
        </div>
      </div>

      {/* Errors */}
      {(error || pageError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {pageError || error}
        </div>
      )}

      {/* Shipment Table */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-500">
          Loading shipments...
        </div>
      ) : (
        <ShipmentTable
          shipments={shipments}
          suppliers={suppliers}
          warehouses={warehouses}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReceive={handleReceiveOpen}
        />
      )}

      {/* Create / Edit Modal */}
      <ShipmentModal
        isOpen={isShipmentModalOpen}
        onClose={closeShipmentModal}
        onSubmit={handleShipmentSubmit}
        initialData={selectedShipment}
        suppliers={suppliers}
        warehouses={warehouses}
        purchaseOrders={purchaseOrders}
        materials={materials}
        shipments={shipments}
        loading={saving}
      />

      {/* Receive Shipment Modal */}
      <ReceiveShipmentModal
        isOpen={isReceiveModalOpen}
        onClose={closeReceiveModal}
        onSubmit={handleReceiveSubmit}
        shipment={selectedShipment}
        loading={saving}
      />

      {/* Shipment Details Modal */}
      <ShipmentDetails
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        shipment={selectedShipment}
        suppliers={suppliers}
        warehouses={warehouses}
        purchaseOrders={purchaseOrders}
        materials={materials}
      />
    </div>
  );
}

export default Shipments;
