import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FiLock } from 'react-icons/fi';
import { useResetPasswordMutation } from '../../services/authApiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

const ResetPassword = () => {
  const [resetComplete, setResetComplete] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await resetPassword({
        token,
        passwords: {
          password: values.password,
          confirmPassword: values.confirmPassword,
        },
      }).unwrap();
      
      if (response.success) {
        setResetComplete(true);
        toast.success('Password reset successful!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Reset Password
        </h2>

        {resetComplete ? (
          <div className="text-center">
            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
              <p>
                Your password has been reset successfully! You will be redirected to the login page.
              </p>
            </div>
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 mb-6">
              Enter your new password below.
            </p>

            <Formik
              initialValues={{
                password: '',
                confirmPassword: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="password" className="form-label">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <Field
                        type="password"
                        id="password"
                        name="password"
                        className={`form-input pl-10 ${
                          touched.password && errors.password ? 'border-red-500' : ''
                        }`}
                        placeholder="Enter new password"
                      />
                    </div>
                    <ErrorMessage
                      name="password"
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

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 