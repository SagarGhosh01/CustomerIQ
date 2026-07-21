// Central API configuration for CustomerIQ Frontend
// Reads VITE_API_URL environment variable from Vercel (or fallback to local dev server)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
