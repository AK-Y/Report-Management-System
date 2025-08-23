import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVerifyOtpMutation, useResendOtpMutation } from '../services/authApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectOtpVerification, clearOtpVerification } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const otpVerification = useSelector(selectOtpVerification);
  
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    if (!otpVerification?.email) {
      navigate('/register');
      return;
    }

    // Focus on first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, otpVerification]);

  const handleChange = (index, e) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1); // Only take the first character
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Focus the last input
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await verifyOtp({ 
        email: otpVerification.email, 
        otp: otpString 
      }).unwrap();
      
      toast.success('Email verified successfully!');
      dispatch(clearOtpVerification());
      navigate('/login');
    } catch (error) {
      toast.error(error?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email: otpVerification.email }).unwrap();
      toast.success('OTP resent successfully!');
      setCanResend(false);
      setTimer(60);
      
      // Restart timer
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            We've sent a verification code to<br />
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              {otpVerification?.email || 'your email'}
            </span>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} onPaste={handlePaste}>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                required
              />
            ))}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isVerifying || otp.join('').length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              Verify
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend
              </button>
            ) : (
              <span className="text-gray-500 dark:text-gray-500">
                Resend in {timer}s
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP; 