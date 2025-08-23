import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, restoreUser } from '../features/auth/authSlice';
import { useGetProfileQuery } from '../services/authApiSlice';
import LoadingSpinner from './LoadingSpinner';

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  
  const { data: userData, isSuccess, isError } = useGetProfileQuery(undefined, {
    skip: !localStorage.getItem('token') || isAuthenticated,
  });
  
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // If we have a token but no user data, try to fetch the user data
        if (localStorage.getItem('token') && !isAuthenticated) {
          console.log('Token found, fetching user data...');
          // The query will run automatically due to the dependencies
        } else {
          // No token or already authenticated, no need to do anything
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsLoading(false);
      }
    };
    
    verifyToken();
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (isSuccess && userData) {
      console.log('User data fetched successfully, restoring user');
      dispatch(restoreUser(userData.user));
      setIsLoading(false);
    } else if (isError) {
      // If there's an error fetching the user data, clear the loading state
      console.error('Error fetching user data');
      setIsLoading(false);
    }
  }, [isSuccess, isError, userData, dispatch]);
  
  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout reached, forcing render');
        setIsLoading(false);
      }
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);
  
  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default PersistLogin; 