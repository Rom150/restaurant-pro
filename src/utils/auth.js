/**
 * Authentication utilities for JWT token management
 */

/**
 * Get JWT access token from localStorage
 * Checks standard token key name
 * 
 * @returns {string|null} The JWT token or null if not found
 */
export const getAuthToken = () => {
  // Use a single standardized token key
  return localStorage.getItem('accessToken') || null;
};

/**
 * Set JWT access token in localStorage
 * 
 * @param {string} token - The JWT token to store
 */
export const setAuthToken = (token) => {
  localStorage.setItem('accessToken', token);
};

/**
 * Remove JWT access token from localStorage
 */
export const clearAuthToken = () => {
  localStorage.removeItem('accessToken');
};

/**
 * Get authorization headers for API requests
 * Includes JWT token if available
 * 
 * @returns {Object} Headers object with Authorization if token exists
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
