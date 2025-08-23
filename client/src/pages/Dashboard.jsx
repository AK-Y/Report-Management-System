import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiFileText, FiSearch, FiList, FiUser, FiClock, FiCheckCircle, FiAlertCircle, FiClipboard, FiFile, FiFolder } from 'react-icons/fi';
import { selectCurrentUser, restoreUser } from '../features/auth/authSlice';
import { useGetProfileQuery } from '../services/authApiSlice';
import { useGetAllInspectionsQuery, useGetAllUsersInspectionsQuery } from '../services/inspectionApiSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [userName, setUserName] = useState(user?.name || 'User');
  
  // Fetch user profile if not available in Redux store
  const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery(undefined, {
    // Only fetch if we have a token but no user data
    skip: !localStorage.getItem('token') || !!user,
  });
  
  // Fetch all users' inspections data
  const { data: allUsersData, isLoading: isAllUsersDataLoading } = useGetAllUsersInspectionsQuery();
  
  // Fetch current user's inspections data
  const { data: userInspectionsData, isLoading: isUserInspectionsLoading } = useGetAllInspectionsQuery();
  
  // Calculate statistics for all users
  const totalReports = allUsersData?.inspections?.length || 0;
  const inspectionReports = allUsersData?.inspections?.filter(i => i.inspectionType === 'Inspection').length || 0;
  const meetingReports = allUsersData?.inspections?.filter(i => i.inspectionType === 'Meeting').length || 0;
  const totalFiles = allUsersData?.inspections?.filter(i => i.file && i.file.trim() !== '').length || 0;
  
  // Loading state
  const isLoading = isAllUsersDataLoading || isUserInspectionsLoading;
  
  // Update user name when user data is available
  useEffect(() => {
    if (user) {
      // User data is already in Redux store
      setUserName(user.name || 'User');
    } else if (profileData && profileData.user) {
      // User data fetched from API
      dispatch(restoreUser(profileData.user));
      setUserName(profileData.user.name || 'User');
    }
  }, [user, profileData, dispatch]);

  return (
    <div className="page-container py-4 max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        {isProfileLoading ? (
          <div className="flex justify-center items-center py-2">
            <LoadingSpinner size="md" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading profile...</span>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Welcome, {userName}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage your inspections and meeting reports efficiently
            </p>
          </>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="dashboard-card">
          <div className="flex items-start p-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <FiClipboard className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <p className="dashboard-stat-label">Total Reports</p>
              {isLoading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
              ) : (
                <p className="dashboard-stat text-blue-600 dark:text-blue-400">{totalReports}</p>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-start p-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <FiFileText className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <p className="dashboard-stat-label">Inspections</p>
              {isLoading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
              ) : (
                <p className="dashboard-stat text-green-600 dark:text-green-400">{inspectionReports}</p>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-start p-4">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <FiClock className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="ml-4">
              <p className="dashboard-stat-label">Meetings</p>
              {isLoading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
              ) : (
                <p className="dashboard-stat text-purple-600 dark:text-purple-400">{meetingReports}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 text-center dark:text-white mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="card hover:shadow-lg transition-shadow">
          <div className="p-5 flex flex-col items-center text-center h-full">
            <div className="p-3 rounded-full bg-blue-200 dark:bg-blue-900 mb-3">
              <FiFileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Create Report
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-300 mb-5 flex-grow">
              Create a new inspection or meeting report with detailed information
            </p>
            <Link
              to="/inspections/create"
              className="btn bg-blue-600 hover:bg-blue-700 text-white dark:text-white px-6 py-2 rounded-md w-48"
            >
              Create Report
            </Link>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="p-5 flex flex-col items-center text-center h-full">
            <div className="p-3 rounded-full bg-purple-200 dark:bg-purple-900 mb-3">
              <FiSearch className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Search Reports
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-300 mb-5 flex-grow">
              Search and view all inspection and meeting reports
            </p>
            <Link
              to="/inspections/search"
              className="btn bg-purple-600 hover:bg-purple-700 text-white dark:text-white px-6 py-2 rounded-md w-48"
            >
              Search Reports
            </Link>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow md:col-span-2">
          <div className="p-5 flex flex-col items-center text-center h-full">
            <div className="p-3 rounded-full bg-green-200 dark:bg-green-900 mb-3">
              <FiList className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              My Reports
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-300 mb-5 flex-grow">
              View, edit, and manage all your created inspection and meeting reports
            </p>
            <Link
              to="/inspections"
              className="btn bg-green-600 hover:bg-green-700 text-white dark:text-white px-6 py-2 rounded-md w-48"
            >
              View My Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;