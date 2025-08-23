import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import authReducer from '../features/auth/authSlice';
import inspectionReducer from '../features/inspections/inspectionSlice';
import { apiSlice } from '../services/apiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inspections: inspectionReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch); 