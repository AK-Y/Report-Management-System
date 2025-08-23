import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FiFileText, FiCalendar, FiMapPin, FiFile, FiSave, FiX, FiInfo, FiUser, FiClipboard, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { useCreateInspectionMutation } from '../../services/inspectionApiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, restoreUser } from '../../features/auth/authSlice';
import { useGetProfileQuery } from '../../services/authApiSlice';

const CreateInspection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [createInspection, { isLoading: isCreating }] = useCreateInspectionMutation();
  const [fileSelected, setFileSelected] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState(null);
  const [initialValues, setInitialValues] = useState({
    inspectionType: '',
    designationOfficer: '',
    inspectingOfficer: '',
    nameOfOfficer: '',
    dateFrom: '',
    dateTo: '',
    inspectedOffice: 'FMDA',
    inspectedInstallation: '',
    installationType: '',
    report: '',
    file: null,
  });
  
  const user = useSelector(selectCurrentUser);
  const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery(undefined, {
    // Only fetch if we have a token but no user data
    skip: !localStorage.getItem('token') || !!user,
  });
  
  // Effect to update form values when user data is available
  useEffect(() => {
    if (user) {
      // User data is already in Redux store
      setInitialValues(prevValues => ({
        ...prevValues,
        designationOfficer: user.designation || '',
        inspectingOfficer: user.designation || '',
        nameOfOfficer: user.name || '',
      }));
    } else if (profileData && profileData.user) {
      // User data fetched from API
      dispatch(restoreUser(profileData.user));
      setInitialValues(prevValues => ({
        ...prevValues,
        designationOfficer: profileData.user.designation || '',
        inspectingOfficer: profileData.user.designation || '',
        nameOfOfficer: profileData.user.name || '',
      }));
    }
  }, [user, profileData, dispatch]);

  // Form validation schema
  const validationSchema = Yup.object({
    inspectionType: Yup.string().required('Report type is required'),
    designationOfficer: Yup.string().required('Designation is required'),
    inspectingOfficer: Yup.string().required('Inspecting officer is required'),
    nameOfOfficer: Yup.string().required('Officer name is required'),
    dateFrom: Yup.date().required('Start date is required'),
    dateTo: Yup.date()
      .required('End date is required')
      .min(Yup.ref('dateFrom'), 'End date must be after or equal to start date'),
    inspectedOffice: Yup.string().required('Inspected office is required'),
    inspectedInstallation: Yup.string().required('Inspected installation is required'),
    installationType: Yup.string().required('Installation type is required'),
    report: Yup.string().required('Report content is required'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      
      // Add all text fields to formData
      Object.keys(values).forEach(key => {
        if (key !== 'file') {
          // Ensure dates are properly formatted
          if (key === 'dateFrom' || key === 'dateTo') {
            formData.append(key, new Date(values[key]).toISOString());
          } else if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
            formData.append(key, values[key]);
          }
        }
      });
      
      // Add file if selected
      if (values.file) {
        formData.append('file', values.file);
      }
      
      // Log the form data for debugging
      console.log('Submitting form data:', Object.fromEntries(formData));
      
      // Validate that all required fields are present
      const requiredFields = [
        'inspectionType',
        'designationOfficer',
        'inspectingOfficer',
        'nameOfOfficer',
        'dateFrom',
        'dateTo',
        'inspectedOffice',
        'inspectedInstallation',
        'report'
      ];
      
      const missingFields = requiredFields.filter(field => !formData.has(field));
      if (missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      // Show warning modal instead of browser confirm
      setFormDataToSubmit(formData);
      setShowWarningModal(true);
      setSubmitting(false);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error?.data?.message || 'Failed to create report. Please try again.');
      setSubmitting(false);
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      const response = await createInspection(formDataToSubmit).unwrap();
      
      if (response.success) {
        toast.success('Report created successfully!');
        setShowWarningModal(false);
        setFormDataToSubmit(null);
        navigate('/inspections');
      } else {
        toast.error('Failed to create report. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error?.data?.message || 'Failed to create report. Please try again.');
    }
  };

  // Loading state for conditional rendering
  const isFormLoading = isCreating || isProfileLoading;

  return (
    <div className="page-container max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
          <FiClipboard className="mr-2 text-blue-600 dark:text-blue-400" />
          Create Inspection/Meeting Report
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Fill in the details to create a new inspection or meeting report
        </p>
      </div>

      {isFormLoading ? (
        <div className="flex justify-center items-center py-10">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Creating report...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({ isSubmitting, touched, errors, setFieldValue, values }) => (
                <Form className="space-y-4">
                  {/* Form Section: Report Type */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                      <FiInfo className="mr-2 text-blue-600 dark:text-blue-400" />
                      Report Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label htmlFor="inspectionType" className="form-label flex items-center">
                          <FiFileText className="mr-1.5 text-blue-600 dark:text-blue-400" />
                          Report Type
                        </label>
                        <div className="mt-1">
                          <Field
                            as="select"
                            id="inspectionType"
                            name="inspectionType"
                            className={`form-input w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                              touched.inspectionType && errors.inspectionType
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <option value="">Select Type</option>
                            <option value="Inspection">Inspection</option>
                            <option value="Meeting">Meeting</option>
                          </Field>
                        </div>
                        <ErrorMessage
                          name="inspectionType"
                          component="div"
                          className="mt-1 text-sm text-red-600 dark:text-red-400"
                        />
                      </div>

                      <div>
                        <label htmlFor="inspectedOffice" className="form-label flex items-center">
                          <FiMapPin className="mr-1.5 text-blue-600 dark:text-blue-400" />
                          Inspected Office
                        </label>
                        <div className="mt-1">
                          <Field
                            type="text"
                            id="inspectedOffice"
                            name="inspectedOffice"
                            className={`form-input w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                              touched.inspectedOffice && errors.inspectedOffice
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter office name"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <FiInfo className="mr-1" /> Default is FMDA, but you can change it if needed
                          </p>
                        </div>
                        <ErrorMessage
                          name="inspectedOffice"
                          component="div"
                          className="mt-1 text-sm text-red-600 dark:text-red-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Section: Officer Details */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                      <FiUser className="mr-2 text-blue-600 dark:text-blue-400" />
                      Officer Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label htmlFor="inspectingOfficer" className="form-label">
                          Inspected Officer
                        </label>
                        <div className="mt-1">
                          <Field
                            as="select"
                            id="inspectingOfficer"
                            name="inspectingOfficer"
                            className={`form-input w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                              touched.inspectingOfficer && errors.inspectingOfficer
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <option value="">Select Officer</option>
                            <option value="CE">CE</option>
                            <option value="SE">SE</option>
                            <option value="EE">EE</option>
                            <option value="SDE">SDE</option>
                          </Field>
                        </div>
                        {initialValues.inspectingOfficer && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <FiInfo className="mr-1" /> Default value from your profile, but you can change it
                          </p>
                        )}
                        <ErrorMessage
                          name="inspectingOfficer"
                          component="div"
                          className="mt-1 text-sm text-red-600 dark:text-red-400"
                        />
                      </div>

                      <div>
                        <label htmlFor="nameOfOfficer" className="form-label">
                          Name of Officer
                        </label>
                        <div className="mt-1 relative">
                          <Field
                            type="text"
                            id="nameOfOfficer"
                            name="nameOfOfficer"
                            className={`form-input w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                              touched.nameOfOfficer && errors.nameOfOfficer
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            } ${initialValues.nameOfOfficer ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                            placeholder="Enter officer name"
                            readOnly={!!initialValues.nameOfOfficer}
                          />
                          {initialValues.nameOfOfficer && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <FiCheck className="h-5 w-5 text-green-500" />
                            </div>
                          )}
                        </div>
                        {initialValues.nameOfOfficer && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <FiInfo className="mr-1" /> Auto-filled from your profile
                          </p>
                        )}
                        <ErrorMessage
                          name="nameOfOfficer"
                          component="div"
                          className="mt-1 text-sm text-red-600 dark:text-red-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Section: Date Range */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                      <FiCalendar className="mr-2 text-blue-600 dark:text-blue-400" />
                      Date Range
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label htmlFor="dateFrom" className="form-label">
                          Date From
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiCalendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <Field
                            type="date"
                            id="dateFrom"
                            name="dateFrom"
                            className={`form-input pl-10 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                              touched.dateFrom && errors.dateFrom
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                        </div>
                        <ErrorMessage
                          name="dateFrom"
                          component="div"
                          className="mt-1 text-sm text-red-600 dark:text-red-400"
                        />
                      </div>

                      <div>
                        <label htmlFor="dateTo" className="form-label">
                          Date To
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiCalendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <Field
                            type="date"
                            id="dateTo"
                            name="dateTo"
                            className={`form-input pl-10 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                              touched.dateTo && errors.dateTo
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                        </div>
                        <ErrorMessage
                          name="dateTo"
                          component="div"
                          className="mt-1 text-sm text-red-600 dark:text-red-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Continue with the rest of the form fields */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                      <FiMapPin className="mr-2 text-blue-600 dark:text-blue-400" />
                      Installation Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 ">
                      <div className="md:col-span-2 order-2">
                        <label htmlFor="inspectedInstallation" className="form-label">
                          Inspected Installation
                        </label>
                        <div className="mt-1">
                          <Field
                            as="textarea"
                            id="inspectedInstallation"
                            name="inspectedInstallation"
                            rows={3}
                            className={`form-input w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                              touched.inspectedInstallation && errors.inspectedInstallation
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Enter detailed description of the inspected installation"
                          />
                        </div>
                        <ErrorMessage
                          name="inspectedInstallation"
                          component="div"
                          className="mt-1 text-sm text-red-600 dark:text-red-400"
                        />
                      </div>

                      <div>
                        <label htmlFor="installationType" className="form-label">
                          Installation Type
                        </label>
                        <div className="mt-1">
                          <Field
                            as="select"
                            id="installationType"
                            name="installationType"
                            className={`form-input w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                              touched.installationType && errors.installationType
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <option value="">Select Installation Type</option>
                            <option value="Water supply">Water supply</option>
                            <option value="Sewerage">Sewerage</option>
                            <option value="Storm water">Storm water</option>
                            <option value="Other">Other</option>
                          </Field>
                        </div>
                        <ErrorMessage
                          name="installationType"
                          component="div"
                          className="mt-1 text-sm text-red-600 dark:text-red-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Report Content */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                      <FiFileText className="mr-2 text-blue-600 dark:text-blue-400" />
                      Report Content
                    </h2>
                    
                    <div>
                      <label htmlFor="report" className="form-label">
                        Report Details
                      </label>
                      <div className="mt-1">
                        <Field
                          as="textarea"
                          id="report"
                          name="report"
                          rows={6}
                          className={`form-input w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            touched.report && errors.report
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="Enter detailed report content..."
                        />
                      </div>
                      <ErrorMessage
                        name="report"
                        component="div"
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                      />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 overflow-hidden">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                      <FiFile className="mr-2 text-blue-600 dark:text-blue-400" />
                      Attachments
                    </h2>
                    
                    <div>
                      <label htmlFor="file" className="form-label">
                        Upload File (Optional)
                      </label>
                      <div className="mt-1">
                        <div className={`border-2 border-dashed rounded-md px-6 pt-5 pb-6 
                          ${fileSelected ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                          <div className="space-y-1 text-center">
                            <FiFile className={`mx-auto h-12 w-12 ${fileSelected ? 'text-green-500 dark:text-green-400' : 'text-gray-400'}`} />
                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                              <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none">
                                <span>{fileSelected ? 'Change file' : 'Upload a file'}</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  onChange={(event) => {
                                    setFieldValue('file', event.currentTarget.files[0]);
                                    setFileSelected(!!event.currentTarget.files[0]);
                                  }}
                                />
                              </label>
                              <p className="pl-1">{fileSelected ? 'or drag and drop to replace' : 'or drag and drop'}</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {fileSelected 
                                ? `Selected: ${values.file?.name}` 
                                : 'PDF, DOC, DOCX, XLS, XLSX up to 10MB'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/inspections')}
                      className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiX className="mr-2 -ml-1 h-5 w-5" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiSave className="mr-2 -ml-1 h-5 w-5" />
                      {isSubmitting ? 'Saving...' : 'Save Report'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Warning: Report Submission
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>Please review the following information carefully:</p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>After submitting this report, you will not be able to edit or delete it.</li>
                    <li>All information will be permanently recorded.</li>
                    <li>Make sure all details are accurate and complete.</li>
                  </ul>
                  <p className="mt-3 font-medium text-yellow-600 dark:text-yellow-400">
                    Are you sure you want to proceed with the submission?
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowWarningModal(false);
                  setFormDataToSubmit(null);
                }}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Yes, Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInspection; 