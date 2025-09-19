// Log levels
export const LOG_LEVELS = {
  DEBUG: { value: 'DEBUG', color: 'bg-gray-500', label: 'Debug' },
  INFO: { value: 'INFO', color: 'bg-blue-500', label: 'Info' },
  WARNING: { value: 'WARNING', color: 'bg-yellow-500', label: 'Warning' },
  ERROR: { value: 'ERROR', color: 'bg-red-500', label: 'Error' },
  CRITICAL: { value: 'CRITICAL', color: 'bg-red-700', label: 'Critical' }
};

// Time ranges
export const TIME_RANGES = [
  { value: '1h', label: 'Last Hour' },
  { value: '6h', label: 'Last 6 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' }
];

// Chart colors
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  success: '#22C55E'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200]
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile'
  },
  LOGS: {
    BASE: '/logs',
    SEARCH: '/logs/search',
    ANALYTICS: '/logs/analytics'
  },
  METRICS: {
    SYSTEM: '/metrics/system',
    APPLICATION: '/metrics/application',
    ALERTS: '/metrics/alerts',
    DASHBOARD: '/metrics/dashboard'
  }
};

// Alert severities
export const ALERT_SEVERITIES = {
  INFO: { value: 'info', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  WARNING: { value: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  ERROR: { value: 'error', color: 'text-red-600', bgColor: 'bg-red-100' },
  CRITICAL: { value: 'critical', color: 'text-red-800', bgColor: 'bg-red-200' }
};

// Service names (these would typically come from API)
export const SERVICES = [
  'auth-service',
  'payment-service',
  'user-service',
  'notification-service',
  'inventory-service',
  'order-service'
];

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 30000,  // 30 seconds
  LOGS: 10000,       // 10 seconds
  METRICS: 15000,    // 15 seconds
  ALERTS: 5000       // 5 seconds
};
