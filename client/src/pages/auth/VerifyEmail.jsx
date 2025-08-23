import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FiKey } from 'react-icons/fi';
import { useVerifyOtpMutation, useResendOtpMutation, useLoginMutation } from '../../services/authApiSlice';
import { setCredentials, clearOtpVerification } from '../../features/auth/authSlice';
import { selectOtpVerification } from '../../features/auth/authSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userId } = useSelector(selectOtpVerification);
  const [countdown, setCountdown] = useState(30);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  React.useEffect(() => {
    // Redirect if no userId
    if (!userId) {
      navigate('/login');
      return;
    }

    // Set up countdown
    let timer;
    if (isCountdownActive && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
    }

    return () => clearTimeout(timer);
  }, [countdown, isCountdownActive, userId, navigate]);

  const validationSchema = Yup.object({
    otp: Yup.string()
      .required('OTP is required')
      .matches(/^[0-9]{6}$/, 'OTP must be 6 digits'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await verifyOtp({
        userId,
        otp: values.otp,
        verifyType: 'email'
      }).unwrap();

      if (response.success) {
        toast.success('Email verified successfully!');
        
        // Store user credentials from the response
        // The server now sends the token and user data directly after verification
        dispatch(setCredentials(response));
        dispatch(clearOtpVerification());
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await resendOtp({ 
        userId,
        verifyType: 'email'
      }).unwrap();

      if (response.success) {
        toast.success('Verification code resent to your email');
        setCountdown(30);
        setIsCountdownActive(true);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error?.data?.message || 'Failed to resend code. Please try again.');
    }
  };

  const isLoading = isVerifying || isResending || isLoggingIn;

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Verify Your Email
        </h2>
        
        <p className="text-gray-600 mb-6 text-center">
          We've sent a verification code to your email address. Please enter it below to verify your account.
        </p>

        <Formik
          initialValues={{
            otp: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="otp" className="form-label">
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiKey className="text-gray-400" />
                  </div>
                  <Field
                    type="text"
                    id="otp"
                    name="otp"
                    className={`form-input pl-10 text-center text-xl tracking-widest ${
                      touched.otp && errors.otp ? 'border-red-500' : ''
                    }`}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <ErrorMessage
                  name="otp"
                  component="div"
                  className="form-error"
                />
              </div>
              
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isVerifying ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    'Verify Email'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          {isCountdownActive ? (
            <p className="text-sm text-gray-500">
              Resend code in {countdown} seconds
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              className="text-primary-600 hover:text-primary-800 hover:underline"
              disabled={isResending}
            >
              {isResending ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="xs" color="primary" />
                  <span className="ml-1">Resending...</span>
                </span>
              ) : (
                'Resend Code'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 