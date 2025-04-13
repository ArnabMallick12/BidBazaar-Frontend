import axios from 'axios';
import { API_URL } from '../config';
import { authAPI } from './auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = authAPI.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authAPI.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        authAPI.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const auctionAPI = {
  // Product Management
  getAllProducts: async () => {
    try {
      const response = await api.get('/auction/products/');
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getProductDetails: async (productId) => {
    try {
      const response = await api.get(`/auction/products/${productId}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product details:", error);
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await api.post("/auction/products/", productData);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  uploadProductImages: async (productId, images) => {
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await api.post(
        `/auction/products/${productId}/upload-images/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  },

  // Bidding System
  placeBid: async (productId, amount, startDate, endDate) => {
    try {
      const response = await api.post(`/auction/products/${productId}/place-bid/`, {
        bid_amount: amount,
        start_date: startDate,
        end_date: endDate
      });
      return response.data;
    } catch (error) {
      console.error("Error placing bid:", error);
      throw error;
    }
  },

  getBids: async (productId) => {
    try {
      const response = await api.get(`/auction/products/${productId}/bids/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching bids:", error);
      throw error;
    }
  },

  getHighestBid: async (productId) => {
    try {
      const response = await api.get(`/auction/products/${productId}/highest-bid/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching highest bid:", error);
      throw error;
    }
  },

  getMyBidsOnProduct: async (productId) => {
    try {
      const response = await api.get(`/auction/products/${productId}/my-bids/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching my bids:", error);
      throw error;
    }
  },

  sellProduct: async (productId, bidId) => {
    try {
      const response = await api.post(`/auction/products/${productId}/sell/${bidId}/`);
      return response.data;
    } catch (error) {
      console.error("Error selling product:", error);
      throw error;
    }
  },

  // Product Filters
  getProductsByCategory: async (category) => {
    try {
      const response = await api.get(`/auction/products/category/`, {
        params: { category }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  },

  getProductsByPriceRange: async (minPrice, maxPrice) => {
    try {
      const response = await api.get(`/auction/products/price-range/`, {
        params: {
          min_price: minPrice,
          max_price: maxPrice
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching products by price range:", error);
      throw error;
    }
  },

  getNewProducts: async () => {
    try {
      const response = await api.get('/auction/products/new/');
      return response.data;
    } catch (error) {
      console.error("Error fetching new products:", error);
      throw error;
    }
  },

  getUsedProducts: async () => {
    try {
      const response = await api.get('/auction/products/used/');
      return response.data;
    } catch (error) {
      console.error("Error fetching used products:", error);
      throw error;
    }
  },

  getSoldProductsBySeller: async (sellerId) => {
    try {
      const response = await api.get(`/auction/products/seller/${sellerId}/sold/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching sold products:", error);
      throw error;
    }
  },

  getActiveAuctionsByEndTime: async () => {
    try {
      const response = await api.get('/auction/products/active/by-end-time/');
      return response.data;
    } catch (error) {
      console.error("Error fetching active auctions:", error);
      throw error;
    }
  },

  getMyListings: async () => {
    try {
      const response = await api.get('/auction/my-listings/');
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching my listings:", error);
      throw error;
    }
  },

  getAllMyBids: async () => {
    try {
      const response = await api.get('/auction/my-bids/');
      return response.data;
    } catch (error) {
      console.error("Error fetching my bids:", error);
      throw error;
    }
  },

  // Error handling helper
  handleError: (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorData = error.response.data;
      return {
        status: error.response.status,
        message: errorData.error || errorData.detail || errorData.message || 'An error occurred',
        data: errorData
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        status: 0,
        message: 'No response from server. Check your network connection.',
        data: null
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        status: 0,
        message: error.message || 'An unknown error occurred',
        data: null
      };
    }
  },

  // Delete operations
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/auction/products/${productId}/delete/`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  deleteBid: async (bidId) => {
    try {
      const response = await api.delete(`/auction/bids/${bidId}/delete/`);
      return response.data;
    } catch (error) {
      console.error("Error deleting bid:", error);
      throw error;
    }
  },

  deleteUserAccount: async () => {
    try {
      const response = await api.delete('/auction/user/delete/');
      // After successful deletion, log out the user
      authAPI.logout();
      return response.data;
    } catch (error) {
      console.error("Error deleting user account:", error);
      throw error;
    }
  }
}; 