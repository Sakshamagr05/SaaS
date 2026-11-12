
import api from "./axios";

const accountId = import.meta.env.VITE_ACCOUNT_ID;

const BASE_URL = `/accounts/${accountId}/purchase-orders`;

export const purchaseOrderApi = {
  getAll: async () => {
    const response = await api.get(`${BASE_URL}/`);
    return response.data;
  },

  getById: async (orderId) => {
    const response = await api.get(`${BASE_URL}/${orderId}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(`${BASE_URL}/`, data);
    return response.data;
  },

  update: async (orderId, data) => {
    const response = await api.patch(`${BASE_URL}/${orderId}`, data);
    return response.data;
  },

  delete: async (orderId) => {
    await api.delete(`${BASE_URL}/${orderId}`);
  },
};
