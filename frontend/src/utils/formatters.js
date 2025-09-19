import { format, formatDistance, isValid } from 'date-fns';

// Date formatters
export const formatDate = (date, formatString = 'MMM dd, yyyy HH:mm:ss') => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValid(dateObj) ? format(dateObj, formatString) : 'Invalid Date';
};

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValid(dateObj) ? formatDistance(dateObj, new Date(), { addSuffix: true }) : 'Invalid Date';
};

// Number formatters
export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return 'N/A';
  return Number(num).toFixed(decimals);
};

export const formatPercentage = (num, decimals = 1) => {
  if (num === null || num === undefined) return 'N/A';
  return `${Number(num).toFixed(decimals)}%`;
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'N/A';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatDuration = (milliseconds) => {
  if (!milliseconds) return 'N/A';
  
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(2)}s`;
  } else {
    return `${(milliseconds / 60000).toFixed(2)}m`;
  }
};

// Log level formatter
export const formatLogLevel = (level) => {
  const colors = {
    DEBUG: 'text-gray-600 bg-gray-100',
    INFO: 'text-blue-600 bg-blue-100',
    WARNING: 'text-yellow-600 bg-yellow-100',
    ERROR: 'text-red-600 bg-red-100',
    CRITICAL: 'text-red-800 bg-red-200'
  };
  
  return {
    level: level || 'UNKNOWN',
    className: colors[level] || 'text-gray-600 bg-gray-100'
  };
};

// Service name formatter
export const formatServiceName = (service) => {
  if (!service) return 'Unknown Service';
  
  return service
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// JSON formatter for display
export const formatJSON = (obj) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return 'Invalid JSON';
  }
};

// URL formatter
export const formatURL = (url) => {
  if (!url) return 'N/A';
  
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch (error) {
    return url;
  }
};

// Status formatter
export const formatStatus = (status) => {
  const statusColors = {
    200: 'text-green-600 bg-green-100',
    201: 'text-green-600 bg-green-100',
    400: 'text-yellow-600 bg-yellow-100',
    401: 'text-red-600 bg-red-100',
    403: 'text-red-600 bg-red-100',
    404: 'text-yellow-600 bg-yellow-100',
    500: 'text-red-800 bg-red-200'
  };
  
  const statusClass = statusColors[status] || 'text-gray-600 bg-gray-100';
  
  return {
    status: status || 'Unknown',
    className: statusClass
  };
};
