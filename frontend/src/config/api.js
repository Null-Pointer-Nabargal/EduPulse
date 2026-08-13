// Production Render backend URL fallback
const DEFAULT_PROD_BACKEND = 'https://edupulse-backend-api.onrender.com';

// API Endpoint Helper supporting local dev proxy and production Vercel/Render deployments
const RAW_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEFAULT_PROD_BACKEND : '');
export const API_BASE_URL = RAW_URL.trim().replace(/\/$/, '');

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) {
    return cleanEndpoint;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
};
