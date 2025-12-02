/**
 * API utility functions for making requests to the backend.
 * This file handles all communication between React frontend and Flask backend.
 */

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Get authentication token from localStorage
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Make a GET request to the backend
 */
export async function apiGet(endpoint) {
  const token = getToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:5001');
    }
    throw error;
  }
}

/**
 * Make a POST request to the backend
 */
export async function apiPost(endpoint, data) {
  const token = getToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:5001');
    }
    throw error;
  }
}

/**
 * Make a PUT request to the backend
 */
export async function apiPut(endpoint, data) {
  const token = getToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:5001');
    }
    throw error;
  }
}

/**
 * Make a DELETE request to the backend
 */
export async function apiDelete(endpoint) {
  const token = getToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:5001');
    }
    throw error;
  }
}

