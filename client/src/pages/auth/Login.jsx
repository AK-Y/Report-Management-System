import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useLoginMutation } from '../../services/authApiSlice';
import {
  setCredentials,
  setOtpVerification,
} from '../../features/auth/authSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await login(values).unwrap();

      if (response.requiresOTP) {
        toast.info('Please verify your phone number to continue.');
        dispatch(
          setOtpVerification({
            userId: response.userId,
            isRequired: true,
          })
        );
        navigate('/verify-otp');
      } else if (response.success) {
        toast.success('Login successful!');
        dispatch(
          setCredentials({
            user: response.user,
            token: response.token,
          })
        );
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="card p-6 shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Login to Your Account
        </h2>

        <Formik
          initialValues={{
            email: '',
            password: '',
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
                <div className="input-icon-wrapper">
                  <div className="input-icon-left">
                    <FiMail />
                  </div>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className={`form-input input-with-icon-left ${
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

              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-icon-wrapper">
                  <div className="input-icon-left">
                    <FiLock />
                  </div>
                  <Field
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={`form-input input-with-icon-left input-with-icon-right ${
                      touched.password && errors.password ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter your password"
                  />
                  <div 
                    className="input-icon-right"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <FiEyeOff className="hover:text-gray-600" />
                    ) : (
                      <FiEye className="hover:text-gray-600" />
                    )}
                  </div>
                </div>
                <ErrorMessage
                  name="password"
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
                  'Login'
                )}
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-4 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 