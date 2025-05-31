/**
 * API service for making HTTP requests to the backend
 */

// Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Create headers for API requests
 * @param {boolean} includeAuth - Whether to include Authorization header
 * @returns {Object} Headers object
 */
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Handle API response
 * @param {Response} response - Fetch Response object
 * @returns {Promise} Parsed response data or error
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Format error message
    const errorMessage = data.message || 'Something went wrong';
    throw new Error(errorMessage);
  }
  
  return data;
};

/**
 * Make a GET request
 * @param {string} endpoint - API endpoint
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise} Response data
 */
export const get = async (endpoint, requiresAuth = true) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: createHeaders(requiresAuth),
    });
    
    return handleResponse(response);
  } catch (error) {
    throw error;
  }
};

/**
 * Make a POST request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise} Response data
 */
export const post = async (endpoint, data, requiresAuth = true) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: createHeaders(requiresAuth),
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  } catch (error) {
    throw error;
  }
};

/**
 * Make a PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise} Response data
 */
export const put = async (endpoint, data, requiresAuth = true) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: createHeaders(requiresAuth),
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  } catch (error) {
    throw error;
  }
};

/**
 * Make a DELETE request
 * @param {string} endpoint - API endpoint
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise} Response data
 */
export const del = async (endpoint, requiresAuth = true) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: createHeaders(requiresAuth),
    });
    
    return handleResponse(response);
  } catch (error) {
    throw error;
  }
};

// Auth Endpoints
export const authAPI = {
  login: (data) => post('/api/v1/auth/login', data, false),
  signup: (data) => post('/api/v1/companies/signup', data, false),
  verifyEmail: (token) => get(`/api/v1/auth/verify-email?token=${token}`, false),
  logout: () => post('/api/v1/auth/logout')
};

// User Endpoints
export const userAPI = {
  getCurrentUser: () => get('/api/v1/users/me'),
  getUsers: (showAll = false) => get(`/api/v1/users?showAll=${showAll}`),
  getUserById: (id) => get(`/api/v1/users/${id}`),
  createUser: (data) => post('/api/v1/users', data),
  updateUser: (id, data) => put(`/api/v1/users/${id}`, data),
  deactivateUser: (id) => del(`/api/v1/users/${id}`)
};

// Pipeline Endpoints
export const pipelineAPI = {
  getPipelines: () => get('/api/v1/pipelines'),
  getPipelineById: (id) => get(`/api/v1/pipelines/${id}`),
  getDefaultPipeline: () => get('/api/v1/pipelines/default'),
  createPipeline: (data) => post('/api/v1/pipelines', data),
  updatePipeline: (id, data) => put(`/api/v1/pipelines/${id}`, data),
  deletePipeline: (id) => del(`/api/v1/pipelines/${id}`)
};

// Company Endpoints
export const companyAPI = {
  getCompanyProfile: () => get('/api/v1/companies/me')
};

export default {
  get,
  post,
  put,
  delete: del,
  authAPI,
  userAPI,
  pipelineAPI,
  companyAPI
};
