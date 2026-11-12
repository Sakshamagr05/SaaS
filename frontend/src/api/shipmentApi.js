
import api from "./axios";

const accountId = import.meta.env.VITE_ACCOUNT_ID;

const BASE_URL = `/accounts/${accountId}/shipments`;

export const shipmentApi = {
  getAll: async () => {
    const response = await api.get(`${BASE_URL}/`);
    return response.data;
  },

  getById: async (shipmentId) => {
    const response = await api.get(`${BASE_URL}/${shipmentId}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(`${BASE_URL}/`, data);
    return response.data;
  },

  update: async (shipmentId, data) => {
    const response = await api.patch(
      `${BASE_URL}/${shipmentId}`,
      data
    );
    return response.data;
  },

  delete: async (shipmentId) => {
    await api.delete(`${BASE_URL}/${shipmentId}`);
  },

  receive: async (shipmentId, data) => {
    const response = await api.post(
      `${BASE_URL}/${shipmentId}/receive`,
      data
    );
    return response.data;
  },
};
