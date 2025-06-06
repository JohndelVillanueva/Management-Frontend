import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

const VerifyEmail: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(5); // For success redirect countdown

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const userId = searchParams.get("userId");

      if (!token || !userId) {
        setLoading(false);
        setSuccess(false);
        setMessage("Invalid verification link - missing parameters");
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/auth/verify-email`, {
          params: { token, userId },
        });

        if (response.data.success) {
          setSuccess(true);
          setMessage("🎉 Email verified successfully! Redirecting to dashboard...");
          localStorage.setItem("authToken", response.data.token);

          // Start countdown
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate("/login", { replace: true });
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        } else {
          setSuccess(false);
          setMessage(response.data.message || "Verification failed");
        }
      } catch (err) {
        setSuccess(false);
        setMessage(
          axios.isAxiosError(err)
            ? err.response?.data?.message || "Verification failed"
            : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [baseUrl, navigate, searchParams]);

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
              onClick={() => navigate("/login", { replace: true })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
            </div>
            <p className="text-lg font-medium text-red-600">{message}</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/login", { replace: true })}
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