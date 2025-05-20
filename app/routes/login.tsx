import { useState, useEffect } from 'react';
import type { MetaFunction } from "@remix-run/node";
import { Link, useNavigate } from '@remix-run/react';
import { authService } from '../services/auth.service';

export const meta: MetaFunction = () => {
  return [
    { title: "Login | My Remix App" },
    { name: "description", content: "Login to your account" },
  ];
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  
  // Check for mobile screen size on client side only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Handle login logic with Strapi
      console.log({ email, password });
      
      // Call the auth service to authenticate
      const response = await authService.login(email, password);
      
      console.log('Login successful', response);
      
      // Navigate to protected page or home after successful login
      navigate('/protected');
      
    } catch (err) {
      console.error('Login error:', err);
      
      // Format error message
      if (typeof err === 'object' && err !== null) {
        if ('message' in err) {
          if (Array.isArray(err.message)) {
            setError(err.message[0] || 'Invalid credentials');
          } else if (typeof err.message === 'string') {
            setError(err.message);
          } else {
            setError('Invalid credentials');
          }
        } else if ('error' in err && typeof err.error === 'string') {
          setError(err.error);
        } else {
          setError('Failed to login. Please check your credentials and try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="authContainer">
      <div className="loginWrapper">
        <div className="authContentWrapper">
          <div className="authCard fadeIn page-transition-right">
            <h1 className="formTitle">Welcome Back</h1>
            
            {error && (
              <div className="errorMessage mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="staggered-animation-container">
              <div className="formGroup">
                <label htmlFor="email" className="styledLabel">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="styledInput"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="formGroup">
                <label htmlFor="password" className="styledLabel">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  className="styledInput"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              
              <Link to="/forgot-password" className="textLink">Forgot password?</Link>
              
              <button 
                type="submit"
                className="styledButton"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <div className="staggered-animation-container">
              <button
                className="socialButton"
                type="button"
                disabled={isSubmitting}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
              
              <button
                className="socialButton"
                type="button"
                disabled={isSubmitting}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                <span>Continue with GitHub</span>
              </button>
              
              <div className="linkText">
                Don&apos;t have an account? <Link to="/signup" className="animated-link">Sign up</Link>
              </div>
            </div>
          </div>
          
          {!isMobile && (
            <div className="illustrationContainer page-transition-left">
              <img 
                src="/illustration.png" 
                alt="Login illustration" 
                className="loginIllustration"
              />
              <div className="illustrationText">
                <h2>Access your account</h2>
                <p>Sign in to manage your projects and access all features</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Show illustration below on mobile */}
        {isMobile && (
          <div className="illustrationContainerMobile">
            <img 
              src="/illustration.png" 
              alt="Login illustration" 
              className="loginIllustrationMobile"
            />
          </div>
        )}
      </div>
    </div>
  );
} 