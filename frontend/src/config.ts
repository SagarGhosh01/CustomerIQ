// Central API configuration for CustomerIQ Frontend
// Reads VITE_API_URL environment variable from Vercel (or default fallback to live Render backend)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://customer-iq-backend.onrender.com';
