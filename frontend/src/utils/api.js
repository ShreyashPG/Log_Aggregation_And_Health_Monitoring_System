import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response time
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.log(`API Call: ${response.config.url} took ${duration}ms`);
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Log error details
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.error || error.message
    });
    
    return Promise.reject(error);
  }
);

// API methods
export const apiMethods = {
  // Auth endpoints
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getProfile: () => apiClient.get('/auth/profile'),
  
  // Log endpoints
  getLogs: (params) => apiClient.get('/logs', { params }),
  createLog: (logData) => apiClient.post('/logs', logData),
  searchLogs: (params) => apiClient.get('/logs/search', { params }),
  getLogAnalytics: (params) => apiClient.get('/logs/analytics', { params }),
  
  // Metrics endpoints
  getSystemMetrics: (params) => apiClient.get('/metrics/system', { params }),
  getApplicationMetrics: (params) => apiClient.get('/metrics/application', { params }),
  getAlerts: () => apiClient.get('/metrics/alerts'),
  getDashboardData: (params) => apiClient.get('/metrics/dashboard', { params }),
};

export default apiClient;
