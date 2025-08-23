import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiLock } from 'react-icons/fi';
import {
  useVerifyOtpMutation,
  useResendOtpMutation,
} from '../../services/authApiSlice';
import {
  selectOtpVerification,
  setCredentials,
  clearOtpVerification,
} from '../../features/auth/authSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const otpVerification = useSelector(selectOtpVerification);
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    if (!otpVerification.userId) {
      navigate('/register');
      return;
    }

    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }

    return () => clearTimeout(timer);
  }, [countdown, navigate, otpVerification]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    try {
      const response = await verifyOtp({
        userId: otpVerification.userId,
        otp,
      }).unwrap();

      if (response.success) {
        toast.success('Phone number verified successfully!');
        dispatch(
          setCredentials({
            user: response.user,
            token: response.token,
          })
        );
        dispatch(clearOtpVerification());
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'OTP verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      const response = await resendOtp({
        userId: otpVerification.userId,
      }).unwrap();

      if (response.success) {
        toast.success('OTP resent successfully!');
        setCountdown(60);
        setCanResend(false);
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Verify Your Phone Number
        </h2>
        <p className="text-center text-gray-600 mb-6">
          We've sent a verification code to your phone number. Please enter the code below.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="otp" className="form-label">
              Verification Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="form-input pl-10"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              'Verify'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-primary-600 hover:underline"
                disabled={isResending}
              >
                {isResending ? 'Resending...' : 'Resend Code'}
              </button>
            ) : (
              <span className="text-gray-500">
                Resend in {countdown} seconds
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP; 