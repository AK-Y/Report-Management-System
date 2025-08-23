import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiEdit, FiLock } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
} from '../services/authApiSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const user = useSelector(selectCurrentUser);
  const { data: profileData, isLoading: isLoadingProfile } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [updatePassword, { isLoading: isUpdatingPassword }] = useUpdatePasswordMutation();

  const profileValidationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    designation: Yup.string().required('Designation is required'),
  });

  const passwordValidationSchema = Yup.object({
    oldPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const handleProfileSubmit = async (values, { setSubmitting }) => {
    try {
      await updateProfile(values).unwrap();
      toast.success('Profile updated successfully!');
      setIsEditMode(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      }).unwrap();
      
      toast.success('Password updated successfully!');
      setIsChangingPassword(false);
      resetForm();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const profileUser = profileData?.user || user;

  if (!profileUser) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Profile not found
        </h2>
        <p className="text-gray-600">
          There was an error loading your profile. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h2>

      <div className="card p-6 mb-8">
        {isEditMode ? (
          <Formik
            initialValues={{
              name: profileUser.name || '',
              designation: profileUser.designation || '',
            }}
            validationSchema={profileValidationSchema}
            onSubmit={handleProfileSubmit}
          >
            {({ isSubmitting, touched, errors }) => (
              <Form className="space-y-4">
                <div>
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      className={`form-input pl-10 ${
                        touched.name && errors.name ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div>
                  <label htmlFor="designation" className="form-label">
                    Designation
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiBriefcase className="text-gray-400" />
                    </div>
                    <Field
                      as="select"
                      id="designation"
                      name="designation"
                      className={`form-input pl-10 ${
                        touched.designation && errors.designation
                          ? 'border-red-500'
                          : ''
                      }`}
                    >
                      <option value="">Select your designation</option>
                      <option value="CE">CE</option>
                      <option value="SE">SE</option>
                      <option value="EE">EE</option>
                      <option value="SDE">SDE</option>
                    </Field>
                  </div>
                  <ErrorMessage
                    name="designation"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsEditMode(false)}
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
                      'Save Changes'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="bg-primary-100 p-4 rounded-full mr-4">
                  <FiUser className="text-primary-600 text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {profileUser.name}
                  </h3>
                  <p className="text-gray-600">{profileUser.designation}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditMode(true)}
                className="text-primary-600 hover:text-primary-800 flex items-center"
              >
                <FiEdit className="mr-1" />
                Edit
              </button>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-start">
                <div className="w-8 mr-4 text-gray-400">
                  <FiMail />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profileUser.email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 mr-4 text-gray-400">
                  <FiPhone />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{profileUser.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Security Settings
        </h3>

        {isChangingPassword ? (
          <Formik
            initialValues={{
              oldPassword: '',
              newPassword: '',
              confirmPassword: '',
            }}
            validationSchema={passwordValidationSchema}
            onSubmit={handlePasswordSubmit}
          >
            {({ isSubmitting, touched, errors }) => (
              <Form className="space-y-4">
                <div>
                  <label htmlFor="oldPassword" className="form-label">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <Field
                      type="password"
                      id="oldPassword"
                      name="oldPassword"
                      className={`form-input pl-10 ${
                        touched.oldPassword && errors.oldPassword
                          ? 'border-red-500'
                          : ''
                      }`}
                      placeholder="Enter your current password"
                    />
                  </div>
                  <ErrorMessage
                    name="oldPassword"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <Field
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className={`form-input pl-10 ${
                        touched.newPassword && errors.newPassword
                          ? 'border-red-500'
                          : ''
                      }`}
                      placeholder="Enter new password"
                    />
                  </div>
                  <ErrorMessage
                    name="newPassword"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <Field
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`form-input pl-10 ${
                        touched.confirmPassword && errors.confirmPassword
                          ? 'border-red-500'
                          : ''
                      }`}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsChangingPassword(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || isUpdatingPassword}
                  >
                    {isSubmitting || isUpdatingPassword ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 mr-4 text-gray-400">
                  <FiLock />
                </div>
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-gray-500">
                    Last changed: Unknown
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="btn btn-outline"
              >
                Change Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 