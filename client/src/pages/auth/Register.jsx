import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiLock, FiBriefcase, FiEye, FiEyeOff } from 'react-icons/fi';
import { useRegisterMutation, useLoginMutation } from '../../services/authApiSlice';
import { setOtpVerification, setCredentials } from '../../features/auth/authSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
    designation: Yup.string().required('Designation is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { confirmPassword, ...userData } = values;
      
      // Format phone number if needed
      if (userData.phoneNumber && !userData.phoneNumber.startsWith('+')) {
        // You can add country code here if needed
        // userData.phoneNumber = `+91${userData.phoneNumber}`;
      }
      
      const response = await register(userData).unwrap();
      
      if (response.success) {
        // Original OTP verification flow - commented out
        /*
        toast.success('Registration successful! Please verify your phone number.');
        dispatch(
          setOtpVerification({
            userId: response.userId,
            isRequired: true,
          })
        );
        navigate('/verify-otp');
        */
        
        // New email verification flow
        if (response.requireEmailVerification) {
          toast.success('Registration successful! Please verify your email.');
          dispatch(
            setOtpVerification({
              userId: response.userId,
              isRequired: true,
            })
          );
          navigate('/verify-email');
          return;
        }
        
        // Auto-login flow (if email verification not required)
        toast.success('Registration successful!');
        
        /* Original direct login code would go here if it existed */
        
        // New auto-login after registration flow
        try {
          const loginResponse = await login({
            email: userData.email,
            password: userData.password
          }).unwrap();
          
          // Store user credentials
          dispatch(setCredentials(loginResponse));
          
          // Redirect to dashboard
          navigate('/dashboard');
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
          toast.info('Account created successfully. Please log in.');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = isRegistering || isLoggingIn;

  return (
    <div className="page-container flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="card p-6 shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Create an Account
        </h2>

        <Formik
          initialValues={{
            name: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            designation: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <div className="input-icon-wrapper">
                  <div className="input-icon-left">
                    <FiUser />
                  </div>
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    className={`form-input input-with-icon-left ${
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
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number
                </label>
                <div className="input-icon-wrapper">
                  <div className="input-icon-left">
                    <FiPhone />
                  </div>
                  <Field
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    className={`form-input input-with-icon-left ${
                      touched.phoneNumber && errors.phoneNumber
                        ? 'border-red-500'
                        : ''
                    }`}
                    placeholder="Enter your 10-digit phone number"
                  />
                </div>
                <ErrorMessage
                  name="phoneNumber"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="designation" className="form-label">
                  Designation
                </label>
                <div className="input-icon-wrapper">
                  <div className="input-icon-left">
                    <FiBriefcase />
                  </div>
                  <Field
                    as="select"
                    id="designation"
                    name="designation"
                    className={`form-input input-with-icon-left ${
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

              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-icon-wrapper">
                  <div className="input-icon-left">
                    <FiLock />
                  </div>
                  <Field
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={`form-input input-with-icon-left input-with-icon-right ${
                      touched.password && errors.password
                        ? 'border-red-500'
                        : ''
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

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="input-icon-wrapper">
                  <div className="input-icon-left">
                    <FiLock />
                  </div>
                  <Field
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-input input-with-icon-left input-with-icon-right ${
                      touched.confirmPassword && errors.confirmPassword
                        ? 'border-red-500'
                        : ''
                    }`}
                    placeholder="Confirm your password"
                  />
                  <div 
                    className="input-icon-right"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="hover:text-gray-600" />
                    ) : (
                      <FiEye className="hover:text-gray-600" />
                    )}
                  </div>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="form-error"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    'Register'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 