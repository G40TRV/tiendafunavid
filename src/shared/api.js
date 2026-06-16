const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
  },
  PRODUCTS: {
    LISTWIMG: `${API_BASE_URL}/products/with-image`,
    LIST: `${API_BASE_URL}/products`,
    BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
  },
  CUSTOMERS: {
    LIST: `${API_BASE_URL}/customers`,
    BY_ID: (id) => `${API_BASE_URL}/customers/${id}`,
  },
  ORDERS: {
    LIST: `${API_BASE_URL}/orders`,
    BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
    STATUS: (id) => `${API_BASE_URL}/orders/${id}/status`,
  },
  CATEGORY:{
    LIST: `${API_BASE_URL}/categories`,
    BY_ID: (id)=> `${API_BASE_URL}/products/${id}`,
  }
};

export default API_BASE_URL;