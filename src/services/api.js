import axios from 'axios';

// Use Vite env variable for API base URL in production (must start with VITE_)
const BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Accommodations
export const accommodationsAPI = {
  getAll: (params) => api.get('/accommodations', { params }),
  getById: (id) => api.get(`/accommodations/${id}`),
  getByCity: (city) => api.get(`/accommodations/city/${city}`),
  getPriceHistory: (id, days = 30) => api.get(`/accommodations/${id}/price-history`, { params: { days } }),
  create: (data) => api.post('/accommodations', data),
  update: (id, data) => api.put(`/accommodations/${id}`, data),
  delete: (id) => api.delete(`/accommodations/${id}`),
  getCities: () => api.get('/accommodations/meta/cities'),
  getTypes: () => api.get('/accommodations/meta/types'),
};

// Analysis
export const analysisAPI = {
  getDemand: (city) => api.get(`/analysis/demand/${city}`),
  getTrends: (city, days = 30) => api.get(`/analysis/trends/${city}`, { params: { days } }),
  getComparison: (city) => api.get(`/analysis/comparison/${city}`),
  getMarketAnalysis: (city) => api.get(`/analysis/market/${city}`),
  generateMarketAnalysis: (city) => api.post(`/analysis/market/${city}/generate`),
  getMarketHistory: (city, limit = 10) => api.get(`/analysis/market/${city}/history`, { params: { limit } }),
  getOccupancy: (city) => api.get(`/analysis/occupancy/${city}`),
  getCategoryAnalysis: (city, type) => api.get(`/analysis/category/${city}/${type}`),
};

// Reports
export const reportsAPI = {
  generatePDF: (city) => api.get(`/reports/pdf/${city}`, { responseType: 'blob' }),
  generateExcel: (city) => api.get(`/reports/excel/${city}`, { responseType: 'blob' }),
  getSummary: (city) => api.get(`/reports/summary/${city}`),
};

// Scraping
export const scrapingAPI = {
  trigger: (city, platform = 'all', options = {}) => api.post(`/scraping/trigger/${city}`, { platform, ...options }),
  getStatus: () => api.get('/scraping/status'),
  getCitiesToUpdate: (hours = 6) => api.get('/scraping/cities-to-update', { params: { hoursThreshold: hours } }),
};

export default api;
