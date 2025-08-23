import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  inspections: [],
  currentInspection: null,
  searchResults: [],
  isLoading: false,
  error: null,
};

const inspectionSlice = createSlice({
  name: 'inspections',
  initialState,
  reducers: {
    setInspections: (state, action) => {
      state.inspections = action.payload;
    },
    setCurrentInspection: (state, action) => {
      state.currentInspection = action.payload;
    },
    clearCurrentInspection: (state) => {
      state.currentInspection = null;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setInspections,
  setCurrentInspection,
  clearCurrentInspection,
  setSearchResults,
  clearSearchResults,
  setLoading,
  setError,
  clearError,
} = inspectionSlice.actions;

export default inspectionSlice.reducer;

export const selectAllInspections = (state) => state.inspections.inspections;
export const selectCurrentInspection = (state) => state.inspections.currentInspection;
export const selectSearchResults = (state) => state.inspections.searchResults;
export const selectInspectionLoading = (state) => state.inspections.isLoading;
export const selectInspectionError = (state) => state.inspections.error; 