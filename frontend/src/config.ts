// Central API configuration for CustomerIQ Frontend
// Dynamically detects if running locally on localhost/127.0.0.1 to prevent online Render sleep delay
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8000' : 'https://customer-iq-backend.onrender.com');
