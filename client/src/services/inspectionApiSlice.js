import { apiSlice } from './apiSlice';

export const inspectionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createInspection: builder.mutation({
      query: (data) => {
        // If data is already FormData, use it directly
        if (data instanceof FormData) {
          return {
            url: '/inspections',
            method: 'POST',
            body: data,
            formData: true,
          };
        }
        
        // Otherwise, create a new FormData object
        const formData = new FormData();
        
        // Append all fields to formData
        Object.keys(data).forEach(key => {
          if (key === 'file' && data[key]) {
            formData.append('file', data[key]);
          } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
            formData.append(key, data[key]);
          }
        });
        
        // Log the form data for debugging
        console.log('Form data being sent:', Object.fromEntries(formData));
        
        return {
          url: '/inspections',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ['Inspection'],
    }),
    
    getAllInspections: builder.query({
      query: () => '/inspections',
      providesTags: ['Inspection'],
    }),
    
    getAllUsersInspections: builder.query({
      query: () => '/inspections/all',
      providesTags: ['Inspection'],
      // Since the backend doesn't have this endpoint yet, we'll simulate it
      // by transforming the response from getAllInspections
      transformResponse: (response) => {
        // For now, we'll just return the user's own inspections
        // In a real implementation, this would be replaced with actual data from all users
        return {
          success: true,
          count: response.inspections.length,
          inspections: response.inspections
        };
      },
    }),
    
    getInspectionDetails: builder.query({
      query: (id) => `/inspections/${id}`,
      providesTags: (result, error, id) => [{ type: 'Inspection', id }],
    }),
    
    updateInspection: builder.mutation({
      query: ({ id, data }) => {
        const formData = new FormData();
        
        // Append all fields to formData
        Object.keys(data).forEach(key => {
          if (key === 'file' && data[key]) {
            formData.append('file', data[key]);
          } else {
            formData.append(key, data[key]);
          }
        });
        
        return {
          url: `/inspections/${id}`,
          method: 'PUT',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Inspection', id },
        'Inspection',
      ],
    }),
    
    deleteInspection: builder.mutation({
      query: (id) => ({
        url: `/inspections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inspection'],
    }),
    
    searchInspections: builder.mutation({
      query: (searchParams) => ({
        url: '/inspections/search',
        method: 'POST',
        body: searchParams,
      }),
    }),
  }),
});

export const {
  useCreateInspectionMutation,
  useGetAllInspectionsQuery,
  useGetAllUsersInspectionsQuery,
  useGetInspectionDetailsQuery,
  useUpdateInspectionMutation,
  useDeleteInspectionMutation,
  useSearchInspectionsMutation,
} = inspectionApiSlice; 