import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

const VerifyEmail: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(5);
  const hasVerifiedRef = useRef(false); // Use ref instead of state

  useEffect(() => {
    // Prevent double verification using ref (persists across strict mode remounts)
    if (hasVerifiedRef.current) {
      console.log('[VerifyEmail] Already verified, skipping...');
      return;
    }
    
    if (!token || !userId) {
      console.log('[VerifyEmail] Missing token or userId');
      setLoading(false);
      setSuccess(false);
      setMessage("Invalid verification link - missing parameters.");
      return;
    }

    if (!baseUrl) {
      console.error('[VerifyEmail] Base URL not configured');
      setLoading(false);
      setSuccess(false);
      setMessage("Configuration error. Please contact support.");
      return;
    }

    const verifyEmail = async () => {
      // Double-check and set flag immediately
      if (hasVerifiedRef.current) {
        console.log('[VerifyEmail] Race condition prevented');
        return;
      }
      
      hasVerifiedRef.current = true; // Set ref immediately to prevent race conditions
      
      try {
        console.log('[VerifyEmail] Starting verification...');
        
        // Backend expects GET with query parameters
        const url = `${baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`;
        console.log('[VerifyEmail] GET to:', url);
        
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        console.log('[VerifyEmail] Response status:', res.status);
        console.log('[VerifyEmail] Response ok:', res.ok);
        
        const contentType = res.headers.get('content-type');
        console.log('[VerifyEmail] Content-Type:', contentType);
        
        // Get response text first
        const responseText = await res.text();
        console.log('[VerifyEmail] Response text:', responseText.substring(0, 200));
        
        // Handle 404 - token likely already used
        if (res.status === 404) {
          console.log('[VerifyEmail] Token not found - likely already verified');
          setSuccess(false);
          setMessage("This verification link has already been used or is invalid. If you already verified your email, you can proceed to login.");
          return;
        }
        
        // Check if response is JSON
        if (!contentType?.includes('application/json')) {
          console.error('[VerifyEmail] Non-JSON response received');
          setSuccess(false);
          setMessage("Server error. Please try again or contact support.");
          return;
        }

        // Parse JSON
        const data = JSON.parse(responseText);
        console.log('[VerifyEmail] Parsed data:', data);

        if (res.ok && data.success) {
          console.log('[VerifyEmail] Verification successful!');
          setSuccess(true);
          setMessage("🎉 Email verified successfully! Redirecting to login...");
          
          // Option 1: Auto-login (store token and redirect to dashboard)
          // localStorage.setItem("authToken", data.token);
          // setTimeout(() => navigate("/dashboard", { replace: true }), 5000);
          
          // Option 2: Manual login (redirect to login page) - Current approach
          // User will need to log in with their credentials
        } else {
          console.error('[VerifyEmail] Verification failed:', data.message);
          setSuccess(false);
          setMessage(data.message || "Verification failed. Please try again.");
        }
      } catch (error) {
        console.error('[VerifyEmail] Verification error:', error);
        setSuccess(false);
        
        if (error instanceof Error && error.message.includes('Invalid server response')) {
          setMessage("Server error occurred. The link may have already been used or is invalid.");
        } else {
          setMessage("An error occurred during verification. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, []); // Empty dependency array - only run once on mount

  // Redirect countdown for success
  useEffect(() => {
    if (success) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Force navigation by using window.location for a clean redirect
            window.location.href = '/login';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [success]);

  const handleGoToLogin = () => {
    // Use window.location for a clean navigation
    window.location.href = '/login';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Email Verification</h2>
        
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 bg-green-100 rounded-full">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-lg font-medium text-green-600">{message}</p>
            <p className="text-gray-500">
              Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Login Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
            </div>
            <p className="text-lg font-medium text-red-600">{message}</p>
            
            <div className="space-y-2 mt-4">
              <button
                onClick={handleGoToLogin}
                className="block w-full px-4 py-2 text-blue-600 hover:underline"
              >
                Go to Login Page
              </button>
              <button
                onClick={() => navigate("/resend-verification", { replace: true })}
                className="block w-full px-4 py-2 text-blue-600 hover:underline"
              >
                Resend Verification Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;