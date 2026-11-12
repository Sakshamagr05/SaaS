
import api from "./axios";

const accountId = import.meta.env.VITE_ACCOUNT_ID;

const BASE_URL = `/accounts/${accountId}/warehouses`;

export const warehouseApi = {
  // Get all warehouses
  getAll: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/`, { params });
    return response.data;
  },

  // Get warehouse by ID
  getById: async (warehouseId) => {
    const response = await api.get(`${BASE_URL}/${warehouseId}`);
    return response.data;
  },

  // Create warehouse
  create: async (warehouseData) => {
    const response = await api.post(`${BASE_URL}/`, warehouseData);
    return response.data;
  },

  // Update warehouse
  update: async (warehouseId, warehouseData) => {
    const response = await api.patch(
      `${BASE_URL}/${warehouseId}`,
      warehouseData
    );
    return response.data;
  },

  // Delete warehouse
  delete: async (warehouseId) => {
    await api.delete(`${BASE_URL}/${warehouseId}`);
  },
};
