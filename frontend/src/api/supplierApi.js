
import api from "./axios";

const accountId = import.meta.env.VITE_ACCOUNT_ID;

const BASE_URL = `/accounts/${accountId}/suppliers`;

export const supplierApi = {
  // Get all suppliers
  getAll: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/`, { params });
    return response.data;
  },

  // Get supplier by ID
  getById: async (supplierId) => {
    const response = await api.get(`${BASE_URL}/${supplierId}`);
    return response.data;
  },

  // Create supplier
  create: async (supplierData) => {
    const response = await api.post(`${BASE_URL}/`, supplierData);
    return response.data;
  },

  // Update supplier
  update: async (supplierId, supplierData) => {
    const response = await api.patch(
      `${BASE_URL}/${supplierId}`,
      supplierData
    );
    return response.data;
  },

  // Delete supplier
  delete: async (supplierId) => {
    await api.delete(`${BASE_URL}/${supplierId}`);
  },
};
