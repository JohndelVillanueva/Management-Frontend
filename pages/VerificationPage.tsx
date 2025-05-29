import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust the import path as necessary


const VerifyEmailPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a verification code');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await verifyEmail(token, false);
      setIsSuccess(true);
      // Redirect after 2 seconds to show success message
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setError(
        error instanceof Error 
          ? error.message 
          : 'Verification failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userId) {
      setError('User ID not found. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await resendVerification(userId);
      setIsSuccess(true);
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to resend verification email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-email-container">
      <h2>Verify Your Email</h2>
      
      {isSuccess ? (
        <div className="success-message">
          <p>Email verified successfully! Redirecting...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="verification-code">Verification Code</label>
            <input
              id="verification-code"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter verification code"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button 
              type="submit" 
              disabled={isLoading || !token.trim()}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
            
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="resend-button"
            >
              {isLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VerifyEmailPage;