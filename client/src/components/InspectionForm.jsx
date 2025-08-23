import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCreateInspectionMutation, useUpdateInspectionMutation } from '../services/inspectionApiSlice';
import { toast } from 'react-toastify';

const InspectionForm = ({ inspection = null, onSuccess }) => {
  const [createInspection, { isLoading: isCreating }] = useCreateInspectionMutation();
  const [updateInspection, { isLoading: isUpdating }] = useUpdateInspectionMutation();
  
  const isLoading = isCreating || isUpdating;
  const isEditMode = !!inspection;

  const formik = useFormik({
    initialValues: {
      title: inspection?.title || '',
      description: inspection?.description || '',
      location: inspection?.location || '',
      inspectionDate: inspection?.inspectionDate 
        ? new Date(inspection.inspectionDate).toISOString().split('T')[0]
        : '',
      status: inspection?.status || 'pending',
      priority: inspection?.priority || 'medium',
      assignedTo: inspection?.assignedTo || '',
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required('Title is required'),
      description: Yup.string()
        .required('Description is required'),
      location: Yup.string()
        .required('Location is required'),
      inspectionDate: Yup.date()
        .required('Inspection date is required'),
      status: Yup.string()
        .oneOf(['pending', 'in-progress', 'completed', 'cancelled'], 'Invalid status')
        .required('Status is required'),
      priority: Yup.string()
        .oneOf(['low', 'medium', 'high', 'critical'], 'Invalid priority')
        .required('Priority is required'),
      assignedTo: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        if (isEditMode) {
          await updateInspection({ 
            id: inspection.id, 
            data: values 
          }).unwrap();
          toast.success('Inspection updated successfully!');
        } else {
          await createInspection(values).unwrap();
          toast.success('Inspection created successfully!');
          formik.resetForm();
        }
        
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to save inspection. Please try again.');
      }
    },
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {isEditMode ? 'Edit Inspection' : 'Create New Inspection'}
      </h2>
      
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <div className="mt-1">
            <input
              id="title"
              name="title"
              type="text"
              className={`appearance-none block w-full px-3 py-2 border ${
                formik.touched.title && formik.errors.title
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
              placeholder="Inspection title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.title}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows="4"
              className={`appearance-none block w-full px-3 py-2 border ${
                formik.touched.description && formik.errors.description
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
              placeholder="Detailed description of the inspection"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.description}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location
          </label>
          <div className="mt-1">
            <input
              id="location"
              name="location"
              type="text"
              className={`appearance-none block w-full px-3 py-2 border ${
                formik.touched.location && formik.errors.location
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
              placeholder="Inspection location"
              value={formik.values.location}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.location && formik.errors.location && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.location}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="inspectionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Inspection Date
          </label>
          <div className="mt-1">
            <input
              id="inspectionDate"
              name="inspectionDate"
              type="date"
              className={`appearance-none block w-full px-3 py-2 border ${
                formik.touched.inspectionDate && formik.errors.inspectionDate
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
              value={formik.values.inspectionDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.inspectionDate && formik.errors.inspectionDate && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.inspectionDate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <div className="mt-1">
              <select
                id="status"
                name="status"
                className={`appearance-none block w-full px-3 py-2 border ${
                  formik.touched.status && formik.errors.status
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-700'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {formik.touched.status && formik.errors.status && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.status}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </label>
            <div className="mt-1">
              <select
                id="priority"
                name="priority"
                className={`appearance-none block w-full px-3 py-2 border ${
                  formik.touched.priority && formik.errors.priority
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-700'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                value={formik.values.priority}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              {formik.touched.priority && formik.errors.priority && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.priority}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Assigned To (User ID)
          </label>
          <div className="mt-1">
            <input
              id="assignedTo"
              name="assignedTo"
              type="text"
              className={`appearance-none block w-full px-3 py-2 border ${
                formik.touched.assignedTo && formik.errors.assignedTo
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-gray-300 dark:border-gray-700'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
              placeholder="User ID (optional)"
              value={formik.values.assignedTo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.assignedTo && formik.errors.assignedTo && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formik.errors.assignedTo}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditMode ? 'Update Inspection' : 'Create Inspection'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InspectionForm; 