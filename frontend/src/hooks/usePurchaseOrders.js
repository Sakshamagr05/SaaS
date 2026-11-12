
import { useCallback, useEffect, useState } from "react";
import { purchaseOrderApi } from "../api/purchaseOrderApi";

export function usePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await purchaseOrderApi.getAll();
      setPurchaseOrders(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to fetch purchase orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const addPurchaseOrder = async (data) => {
    const newOrder = await purchaseOrderApi.create(data);

    setPurchaseOrders((prev) => [newOrder, ...prev]);

    return newOrder;
  };

  const editPurchaseOrder = async (orderId, data) => {
    const updatedOrder = await purchaseOrderApi.update(orderId, data);

    setPurchaseOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? updatedOrder : order
      )
    );

    return updatedOrder;
  };

  const removePurchaseOrder = async (orderId) => {
    await purchaseOrderApi.delete(orderId);

    setPurchaseOrders((prev) =>
      prev.filter((order) => order.id !== orderId)
    );
  };

  return {
    purchaseOrders,
    loading,
    error,
    fetchPurchaseOrders,
    addPurchaseOrder,
    editPurchaseOrder,
    removePurchaseOrder,
  };
}
