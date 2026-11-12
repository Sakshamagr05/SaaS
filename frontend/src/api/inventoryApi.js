
import api from "./axios";

const accountId = import.meta.env.VITE_ACCOUNT_ID;

const BASE_URL = `/accounts/${accountId}/inventory`;

export const inventoryApi = {
  // Get all inventory records
  getAll: async () => {
    const response = await api.get(`${BASE_URL}/`);
    return response.data;
  },

  // Get inventory for a specific warehouse
  getByWarehouse: async (warehouseId) => {
    const response = await api.get(
      `${BASE_URL}/warehouses/${warehouseId}`
    );
    return response.data;
  },

  // Increase or decrease inventory
  adjust: async (data) => {
    const response = await api.post(
      `${BASE_URL}/adjustments`,
      data
    );
    return response.data;
  },

  // Get inventory transaction history
  getTransactions: async (params = {}) => {
    const response = await api.get(
      `${BASE_URL}/transactions`,
      { params }
    );
    return response.data;
  },
};
