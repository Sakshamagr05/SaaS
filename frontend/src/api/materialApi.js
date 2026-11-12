
import api from "./axios";

const accountId = import.meta.env.VITE_ACCOUNT_ID;

const BASE_URL = `/accounts/${accountId}/materials`;

export const materialApi = {
  // Fetch all materials
  getAll: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/`, { params });
    return response.data;
  },

  // Fetch material by ID
  getById: async (materialId) => {
    const response = await api.get(`${BASE_URL}/${materialId}`);
    return response.data;
  },

  // Create material
  create: async (materialData) => {
    const response = await api.post(`${BASE_URL}/`, materialData);
    return response.data;
  },

  // Update material
  update: async (materialId, materialData) => {
    const response = await api.patch(
      `${BASE_URL}/${materialId}`,
      materialData
    );
    return response.data;
  },

  // Delete material
  delete: async (materialId) => {
    await api.delete(`${BASE_URL}/${materialId}`);
  },
};
