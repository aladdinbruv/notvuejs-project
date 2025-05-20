import { useState } from 'react';
import type { MetaFunction } from "@remix-run/node";
import { Link } from '@remix-run/react';
import { authService } from '../services/auth.service';

export const meta: MetaFunction = () => {
  return [
    { title: "Forgot Password | My Remix App" },
    { name: "description", content: "Reset your password" },
  ];
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Call Strapi forgot password API
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error('Forgot password error:', err);
      if (err && typeof err === 'object' && 'message' in err) {
        const errorObj = err as { message: string | string[] };
        if (Array.isArray(errorObj.message)) {
          setError(errorObj.message[0] || 'Failed to send reset email. Please try again.');
        } else if (errorObj.message) {
          setError(errorObj.message);
        } else {
          setError('Failed to send reset email. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="authContainer">
      <div className="authCard fadeIn">
        <h1 className="formTitle">Forgot Password</h1>
        <p className="formSubtitle">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
        
        {error && (
          <div className="errorMessage">
            {error}
          </div>
        )}
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="staggered-animation-container">
            <div className="formGroup">
              <label htmlFor="email" className="styledLabel">Email Address</label>
              <input 
                type="email" 
                id="email" 
                className="styledInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                required 
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit"
              className="styledButton"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="successMessage slideUp">
            <p>
              <strong>Email sent!</strong> If an account exists with the email {email},
              you will receive a password reset link shortly.
            </p>
          </div>
        )}
        
        <div className="linkText">
          <Link to="/login" className="animated-link">Back to login</Link>
        </div>
      </div>
    </div>
  );
} 