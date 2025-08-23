import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FiFileText, FiCalendar, FiMapPin, FiFile } from 'react-icons/fi';
import {
  useGetInspectionDetailsQuery,
  useUpdateInspectionMutation,
} from '../../services/inspectionApiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

const EditInspection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fileSelected, setFileSelected] = useState(false);

  const {
    data: inspectionData,
    isLoading: isLoadingInspection,
    error: inspectionError,
  } = useGetInspectionDetailsQuery(id);

  const [updateInspection, { isLoading: isUpdating }] = useUpdateInspectionMutation();

  useEffect(() => {
    if (inspectionError) {
      toast.error('Failed to load inspection details');
      navigate('/inspections');
    }
  }, [inspectionError, navigate]);

  const validationSchema = Yup.object({
    inspectionType: Yup.string().required('Inspection type is required'),
    designationOfficer: Yup.string().required('Designation is required'),
    inspectingOfficer: Yup.string().required('Inspecting officer is required'),
    nameOfOfficer: Yup.string().required('Name of officer is required'),
    dateFrom: Yup.date().required('Start date is required'),
    dateTo: Yup.date()
      .required('End date is required')
      .min(
        Yup.ref('dateFrom'),
        'End date must be after or equal to start date'
      ),
    inspectedOffice: Yup.string().required('Inspected office is required'),
    inspectedInstallation: Yup.string().required(
      'Inspected installation is required'
    ),
    installationType: Yup.string().required('Installation type is required'),
    report: Yup.string().required('Report details are required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = {
        ...values,
        fileUploadRequired: fileSelected || !!inspectionData?.inspection?.file,
      };

      const response = await updateInspection({
        id,
        data: formData,
      }).unwrap();

      if (response.success) {
        toast.success('Inspection report updated successfully!');
        navigate('/inspections');
      }
    } catch (error) {
      toast.error(
        error?.data?.message || 'Failed to update inspection. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoadingInspection) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const inspection = inspectionData?.inspection;

  if (!inspection) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Inspection not found
        </h2>
        <button
          onClick={() => navigate('/inspections')}
          className="btn btn-primary"
        >
          Back to Inspections
        </button>
      </div>
    );
  }

  // Format dates for form input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const initialValues = {
    inspectionType: inspection.inspectionType || '',
    designationOfficer: inspection.designationOfficer || '',
    inspectingOfficer: inspection.inspectingOfficer || '',
    nameOfOfficer: inspection.nameOfOfficer || '',
    dateFrom: formatDateForInput(inspection.dateFrom) || '',
    dateTo: formatDateForInput(inspection.dateTo) || '',
    inspectedOffice: inspection.inspectedOffice || 'FMDA',
    inspectedInstallation: inspection.inspectedInstallation || '',
    installationType: inspection.installationType || '',
    report: inspection.report || '',
    file: null,
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Edit Inspection/Meeting Report
        </h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, touched, errors, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inspectionType" className="form-label">
                    Inspection Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiFileText className="text-gray-400" />
                    </div>
                    <Field
                      as="select"
                      id="inspectionType"
                      name="inspectionType"
                      className={`form-input pl-10 ${
                        touched.inspectionType && errors.inspectionType
                          ? 'border-red-500'
                          : ''
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
                    className="form-error"
                  />
                </div>

                <div>
                  <label htmlFor="designationOfficer" className="form-label">
                    Designation of Officer
                  </label>
                  <Field
                    as="select"
                    id="designationOfficer"
                    name="designationOfficer"
                    className={`form-input ${
                      touched.designationOfficer && errors.designationOfficer
                        ? 'border-red-500'
                        : ''
                    }`}
                  >
                    <option value="">Select Designation</option>
                    <option value="CE">CE</option>
                    <option value="SE">SE</option>
                    <option value="EE">EE</option>
                    <option value="SDE">SDE</option>
                  </Field>
                  <ErrorMessage
                    name="designationOfficer"
                    component="div"
                    className="form-error"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inspectingOfficer" className="form-label">
                    Inspecting Officer
                  </label>
                  <Field
                    as="select"
                    id="inspectingOfficer"
                    name="inspectingOfficer"
                    className={`form-input ${
                      touched.inspectingOfficer && errors.inspectingOfficer
                        ? 'border-red-500'
                        : ''
                    }`}
                  >
                    <option value="">Select Officer</option>
                    <option value="CE">CE</option>
                    <option value="SE">SE</option>
                    <option value="EE">EE</option>
                    <option value="SDE">SDE</option>
                  </Field>
                  <ErrorMessage
                    name="inspectingOfficer"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div>
                  <label htmlFor="nameOfOfficer" className="form-label">
                    Name of Officer
                  </label>
                  <Field
                    type="text"
                    id="nameOfOfficer"
                    name="nameOfOfficer"
                    className={`form-input ${
                      touched.nameOfOfficer && errors.nameOfOfficer
                        ? 'border-red-500'
                        : ''
                    }`}
                    placeholder="Enter officer name"
                  />
                  <ErrorMessage
                    name="nameOfOfficer"
                    component="div"
                    className="form-error"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dateFrom" className="form-label">
                    Date From
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <Field
                      type="date"
                      id="dateFrom"
                      name="dateFrom"
                      className={`form-input pl-10 ${
                        touched.dateFrom && errors.dateFrom
                          ? 'border-red-500'
                          : ''
                      }`}
                    />
                  </div>
                  <ErrorMessage
                    name="dateFrom"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div>
                  <label htmlFor="dateTo" className="form-label">
                    Date To
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <Field
                      type="date"
                      id="dateTo"
                      name="dateTo"
                      className={`form-input pl-10 ${
                        touched.dateTo && errors.dateTo ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  <ErrorMessage
                    name="dateTo"
                    component="div"
                    className="form-error"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inspectedOffice" className="form-label">
                    Inspected Office
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="text-gray-400" />
                    </div>
                    <Field
                      as="select"
                      id="inspectedOffice"
                      name="inspectedOffice"
                      className={`form-input pl-10 ${
                        touched.inspectedOffice && errors.inspectedOffice
                          ? 'border-red-500'
                          : ''
                      }`}
                    >
                      <option value="FMDA">FMDA</option>
                    </Field>
                  </div>
                  <ErrorMessage
                    name="inspectedOffice"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div>
                  <label htmlFor="installationType" className="form-label">
                    Installation Type
                  </label>
                  <Field
                    as="select"
                    id="installationType"
                    name="installationType"
                    className={`form-input ${
                      touched.installationType && errors.installationType
                        ? 'border-red-500'
                        : ''
                    }`}
                  >
                    <option value="">Select Installation Type</option>
                    <option value="Water supply">Water supply</option>
                    <option value="Sewerage">Sewerage</option>
                    <option value="Storm water">Storm water</option>
                    <option value="Other">Other</option>
                  </Field>
                  <ErrorMessage
                    name="installationType"
                    component="div"
                    className="form-error"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="inspectedInstallation" className="form-label">
                  Inspected Installation
                </label>
                <Field
                  as="textarea"
                  id="inspectedInstallation"
                  name="inspectedInstallation"
                  rows="3"
                  className={`form-input ${
                    touched.inspectedInstallation && errors.inspectedInstallation
                      ? 'border-red-500'
                      : ''
                  }`}
                  placeholder="Enter details of the inspected installation"
                />
                <ErrorMessage
                  name="inspectedInstallation"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="report" className="form-label">
                  Report
                </label>
                <Field
                  as="textarea"
                  id="report"
                  name="report"
                  rows="5"
                  className={`form-input ${
                    touched.report && errors.report ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter detailed report"
                />
                <ErrorMessage
                  name="report"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="file" className="form-label">
                  Upload File
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFile className="text-gray-400" />
                  </div>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    className="form-input pl-10"
                    onChange={(event) => {
                      setFieldValue('file', event.currentTarget.files[0]);
                      setFileSelected(!!event.currentTarget.files[0]);
                    }}
                  />
                </div>
                {inspection.file && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">Current file: </span>
                    <a
                      href={`http://localhost:5000/${inspection.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      View File
                    </a>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, Word, Excel, and images
                </p>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate('/inspections')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || isUpdating}
                >
                  {isSubmitting || isUpdating ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    'Update Report'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditInspection; 