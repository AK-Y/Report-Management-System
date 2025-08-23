import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEye, FiFileText, FiCalendar, FiPlus, FiPaperclip } from 'react-icons/fi';
import { format } from 'date-fns';
import { useGetAllInspectionsQuery } from '../../services/inspectionApiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

const InspectionList = () => {
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const {
    data: inspectionsData,
    isLoading,
  } = useGetAllInspectionsQuery();

  const openModal = (inspection) => {
    setSelectedInspection(inspection);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInspection(null);
  };

  if (isLoading) {
    return (
      <div className="page-container max-w-5xl mx-auto py-6 px-4">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading reports...</span>
        </div>
      </div>
    );
  }

  const inspections = inspectionsData?.inspections || [];

  return (
    <div className="page-container max-w-5xl mx-auto py-6 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            My Reports
          </h1>
          <Link
            to="/inspections/create"
            className="btn bg-blue-600 hover:bg-blue-700 text-white dark:text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiPlus className="mr-2" /> Create New
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          View your inspection and meeting reports
        </p>
      </div>

      {inspections.length === 0 ? (
        <div className="card p-8 text-center">
          <FiFileText className="mx-auto text-gray-400 dark:text-gray-500 text-5xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            No inspection reports found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't created any inspection or meeting reports yet.
          </p>
          <Link to="/inspections/create" className="btn btn-primary">
            Create Your First Report
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Installation
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Office
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Date
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {inspections.map((inspection) => (
                <tr key={inspection._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        inspection.inspectionType === 'Inspection'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}
                    >
                      {inspection.inspectionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {inspection.inspectedInstallation.length > 30
                      ? `${inspection.inspectedInstallation.substring(0, 30)}...`
                      : inspection.inspectedInstallation}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {inspection.inspectedOffice}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {format(new Date(inspection.dateFrom), 'dd/MM/yyyy')} - {format(new Date(inspection.dateTo), 'dd/MM/yyyy')}
                  </td>
                  <td className="py-3 pl-8">
                    <button
                      onClick={() => openModal(inspection)}
                      className="text-blue-600  hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Details"
                    >
                      <FiEye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Details Modal */}
      {isModalOpen && selectedInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Report Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Inspection Type</p>
                  <p className="font-medium dark:text-white">{selectedInspection.inspectionType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Installation Type</p>
                  <p className="font-medium dark:text-white">{selectedInspection.installationType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Inspecting Officer</p>
                  <p className="font-medium dark:text-white">{selectedInspection.inspectingOfficer} - {selectedInspection.nameOfOfficer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Inspected Office</p>
                  <p className="font-medium dark:text-white">{selectedInspection.inspectedOffice}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date Range</p>
                  <p className="font-medium flex items-center dark:text-white">
                    <FiCalendar className="mr-1 text-gray-400" />
                    {format(new Date(selectedInspection.dateFrom), 'dd/MM/yyyy')} - {format(new Date(selectedInspection.dateTo), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Inspected Installation</p>
                <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded dark:text-white">{selectedInspection.inspectedInstallation}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Report</p>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded whitespace-pre-wrap dark:text-white">
                  {selectedInspection.report}
                </div>
              </div>

              {selectedInspection.file && (
                  <div className="flex items-center justify-end">
                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${selectedInspection.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 btn btn-sm btn-primary flex  items-center"
                  >
                    <FiEye className="mr-1" />
                    View Attachment
                  </a>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeModal}
                  className="btn btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionList; 