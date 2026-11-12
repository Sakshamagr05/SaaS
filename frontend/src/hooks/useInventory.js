
import { useCallback, useEffect, useState } from "react";
import { inventoryApi } from "../api/inventoryApi";

export function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await inventoryApi.getAll();
      setInventory(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to fetch inventory."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const adjustInventory = async (data) => {
    const updatedInventory = await inventoryApi.adjust(data);

    setInventory((prev) => {
      const exists = prev.some(
        (item) => item.id === updatedInventory.id
      );

      if (exists) {
        return prev.map((item) =>
          item.id === updatedInventory.id
            ? updatedInventory
            : item
        );
      }

      return [updatedInventory, ...prev];
    });

    return updatedInventory;
  };

  return {
    inventory,
    loading,
    error,
    fetchInventory,
    adjustInventory,
  };
}
