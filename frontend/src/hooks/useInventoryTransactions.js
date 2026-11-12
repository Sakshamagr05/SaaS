
import { useCallback, useEffect, useState } from "react";
import { inventoryTransactionApi } from "../api/inventoryTransactionApi";

const PAGE_SIZE = 100;

export function useInventoryTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    warehouse_id: "",
    material_id: "",
  });

  const [page, setPage] = useState(0);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        offset: page * PAGE_SIZE,
        limit: PAGE_SIZE,
      };

      if (filters.warehouse_id) {
        params.warehouse_id = filters.warehouse_id;
      }

      if (filters.material_id) {
        params.material_id = filters.material_id;
      }

      const data = await inventoryTransactionApi.getAll(params);
      setTransactions(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to fetch inventory transactions."
      );
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  return {
    transactions,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    hasNextPage: transactions.length === PAGE_SIZE,
    fetchTransactions,
  };
}
