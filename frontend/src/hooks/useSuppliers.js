
import { useCallback, useEffect, useState } from "react";
import { supplierApi } from "../api/supplierApi";

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await supplierApi.getAll();
      setSuppliers(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to fetch suppliers"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Create supplier
  const addSupplier = async (supplierData) => {
    const newSupplier = await supplierApi.create(supplierData);

    setSuppliers((prev) => [...prev, newSupplier]);

    return newSupplier;
  };

  // Update supplier
  const editSupplier = async (supplierId, supplierData) => {
    const updatedSupplier = await supplierApi.update(
      supplierId,
      supplierData
    );

    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.id === supplierId ? updatedSupplier : supplier
      )
    );

    return updatedSupplier;
  };

  // Delete supplier
  const removeSupplier = async (supplierId) => {
    await supplierApi.delete(supplierId);

    setSuppliers((prev) =>
      prev.filter((supplier) => supplier.id !== supplierId)
    );
  };

  // Fetch when hook is mounted
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    addSupplier,
    editSupplier,
    removeSupplier,
  };
}
