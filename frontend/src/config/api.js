// API Endpoint Helper supporting both local dev proxy and production Vercel/Render deployments
const RAW_URL = import.meta.env.VITE_API_URL || '';
export const API_BASE_URL = RAW_URL.trim().replace(/\/$/, '');

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) {
    return cleanEndpoint;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
};
