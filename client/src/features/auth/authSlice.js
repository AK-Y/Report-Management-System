import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  // token: null,
  isAuthenticated: localStorage.getItem('token') ? true : false,
  // isAuthenticated: false,
  isLoading: false,
  otpVerification: {
    userId: null,
    isRequired: false,
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      // Store user ID in localStorage for persistence
      if (user && user._id) {
        localStorage.setItem('userId', user._id);
      }
    },
    restoreUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setOtpVerification: (state, action) => {
      state.otpVerification = action.payload;
    },
    clearOtpVerification: (state) => {
      state.otpVerification = {
        userId: null,
        isRequired: false,
      };
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setCredentials,
  restoreUser,
  setOtpVerification,
  clearOtpVerification,
  logout,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectOtpVerification = (state) => state.auth.otpVerification;
export const selectIsLoading = (state) => state.auth.isLoading; 