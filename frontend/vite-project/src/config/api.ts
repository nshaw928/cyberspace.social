/**
 * API Configuration
 * 
 * In development: Uses VITE_API_URL (http://localhost:8000)
 * In production: Uses empty string (same origin - nginx proxies API requests)
 */

// API base URL - empty string means same origin (nginx will proxy)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get the full API URL for a given path
 * @param path - The API path (e.g., '/api/posts/feed/')
 * @returns The full URL
 */
export const getApiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
