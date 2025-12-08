// src/config/apiConfig.ts
/**
 * Centralized configuration for all URLs
 * All base URLs are defined once here and imported wherever needed across the app
 */

// API Base URL - backend API endpoint
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

// Application Base URL - frontend home/landing page
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:8080/';

// API Endpoints
export const API_ENDPOINTS = {
  // Parent endpoints
  PARENTS: `${API_BASE_URL}/parents`,
  LOGIN: `${API_BASE_URL}/login`,
  
  // Student endpoints
  STUDENTS: `${API_BASE_URL}/students`,
  
  // User endpoints
  USER: `${API_BASE_URL}/user`,
  
  // Declaration endpoints
  DECLARATIONS: `${API_BASE_URL}/declarations`,
};
