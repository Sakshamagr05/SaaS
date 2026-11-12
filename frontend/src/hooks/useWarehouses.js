
import { useCallback, useEffect, useState } from "react";
import { warehouseApi } from "../api/warehouseApi";

export function useWarehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch warehouses
  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await warehouseApi.getAll();
      setWarehouses(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to fetch warehouses"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Add warehouse
  const addWarehouse = async (warehouseData) => {
    const newWarehouse = await warehouseApi.create(warehouseData);

    setWarehouses((prev) => [...prev, newWarehouse]);

    return newWarehouse;
  };

  // Update warehouse
  const editWarehouse = async (warehouseId, warehouseData) => {
    const updatedWarehouse = await warehouseApi.update(
      warehouseId,
      warehouseData
    );

    setWarehouses((prev) =>
      prev.map((warehouse) =>
        warehouse.id === warehouseId ? updatedWarehouse : warehouse
      )
    );

    return updatedWarehouse;
  };

  // Delete warehouse
  const removeWarehouse = async (warehouseId) => {
    await warehouseApi.delete(warehouseId);

    setWarehouses((prev) =>
      prev.filter((warehouse) => warehouse.id !== warehouseId)
    );
  };

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  return {
    warehouses,
    loading,
    error,
    fetchWarehouses,
    addWarehouse,
    editWarehouse,
    removeWarehouse,
  };
}
