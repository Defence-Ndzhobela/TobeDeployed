// src/config/apiConfig.ts
/**
 * Centralized API configuration
 * All API calls should use this configuration to ensure consistency
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// You can export specific endpoint URLs if needed
export const API_ENDPOINTS = {
  // Parent endpoints
  PARENTS: `${API_BASE_URL}/parents`,
  LOGIN: `${API_BASE_URL}/login`,
  
  // Student endpoints
  STUDENTS: `${API_BASE_URL}/students`,
  
  // Declaration endpoints (adjust if needed based on your backend)
  DECLARATIONS: `${API_BASE_URL}/declarations`,
};
