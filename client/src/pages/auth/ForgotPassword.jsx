import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FiMail } from 'react-icons/fi';
import { useForgotPasswordMutation } from '../../services/authApiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await forgotPassword(values).unwrap();
      
      if (response.success) {
        setEmailSent(true);
        toast.success('Password reset email sent successfully!');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Forgot Password
        </h2>

        {emailSent ? (
          <div className="text-center">
            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
              <p>
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
            </div>
            <Link to="/login" className="btn btn-primary">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <Formik
              initialValues={{
                email: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-gray-400" />
                      </div>
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        className={`form-input pl-10 ${
                          touched.email && errors.email ? 'border-red-500' : ''
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    <ErrorMessage
                      name="email"
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
                      'Send Reset Link'
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="text-primary-600 hover:underline">
                  Back to Login
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 