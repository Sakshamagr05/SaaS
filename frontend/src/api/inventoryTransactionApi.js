
import api from "./axios";

const accountId = import.meta.env.VITE_ACCOUNT_ID;

const BASE_URL = `/accounts/${accountId}/inventory`;

export const inventoryTransactionApi = {
  getAll: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/transactions`, {
      params,
    });

    return response.data;
  },
};
