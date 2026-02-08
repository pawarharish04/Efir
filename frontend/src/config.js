const isProduction = import.meta.env.PROD;

// In production, this will be your deployed backend URL.
// In development, it falls back to localhost.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
