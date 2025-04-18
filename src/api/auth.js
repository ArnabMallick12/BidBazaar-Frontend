import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "ngrok-skip-browser-warning": "any-value" ,
  },
});

// Helper function to validate token data
const validateTokenData = (data) => {
  if (!data || !data.access_token || !data.refresh_token) {
    throw new Error('Invalid token data received');
  }
  return true;
};

// Helper function to store auth data
const storeAuthData = (data) => {
  try {
    if (validateTokenData(data)) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return true;
    }
  } catch (error) {
    console.error('Error storing auth data:', error);
    // Clear any partial data
    authAPI.logout();
    return false;
  }
};

export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await api.post('/user/login/', {
        username,
        password,
      });

      // Validate and store the response data
      if (storeAuthData(response.data)) {
        console.log('Login successful:', response.data.message);
        return response.data;
      } else {
        throw new Error('Failed to store authentication data');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial data
      authAPI.logout();
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/user/register/', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });

      // If registration is successful, automatically log in
      if (response.data) {
        console.log('Registration successful:', response.data.message);
        return await authAPI.login(userData.username, userData.password);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/user/logout/', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local storage even if server logout fails
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/user/refresh/', {
        refresh: refreshToken,
      });

      if (response.data && response.data.access) {
        localStorage.setItem('token', response.data.access);
        console.log('Token refreshed successfully');
        return response.data;
      } else {
        throw new Error('Invalid refresh token response');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, log out the user
      authAPI.logout();
      throw error;
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token; // Returns true if token exists, false otherwise
  },

  // Add a method to get the current token
  getToken: () => {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Add a method to get the refresh token
  getRefreshToken: () => {
    try {
      return localStorage.getItem('refresh_token');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }
}; 