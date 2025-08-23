import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../features/auth/authSlice';

// Get the API URL from environment variables or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* console.log("API URL is:", API_URL); */

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Try to get token from state, fallback to localStorage
    let token = getState().auth.token;
    if (!token) {
      token = localStorage.getItem('token');
    }
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // Don't set Content-Type for FormData
    if (!endpoint.includes('createInspection') && !endpoint.includes('updateInspection')) {
      headers.set('Content-Type', 'application/json');
    }
    
    return headers;
  },
});

// Create a custom base query with error handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 Unauthorized responses
  if (result.error && result.error.status === 401) {
    console.log('401 Unauthorized response, logging out');
    // Dispatch logout action
    api.dispatch(logout());
  }
  
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Inspection'],
  endpoints: (builder) => ({}),
}); 