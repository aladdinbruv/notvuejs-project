import { useState, useEffect } from 'react';
import type { MetaFunction } from "@remix-run/node";
import { Link, useNavigate } from '@remix-run/react';
import { authService } from '../services/auth.service';

export const meta: MetaFunction = () => {
  return [
    { title: "Sign Up | My Remix App" },
    { name: "description", content: "Create a new account" },
  ];
};

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
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
      // Handle signup logic here
      console.log({ firstName, lastName, email, password, agreeToTerms });
      
      // For Strapi, we'll use username as firstName + lastName
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
      
      // Register the user using the auth service
      const response = await authService.register(username, email, password);
      
      console.log('Registration successful', response);
      
      // Navigate to login after successful registration
      navigate('/login');
      
    } catch (err) {
      console.error('Signup error:', err);
      
      // Format error message
      if (typeof err === 'object' && err !== null) {
        if ('message' in err) {
          if (Array.isArray(err.message)) {
            setError(err.message[0] || 'Registration failed. Please try again.');
          } else if (typeof err.message === 'string') {
            setError(err.message);
          } else {
            setError('Registration failed. Please try again.');
          }
        } else if ('error' in err && typeof err.error === 'string') {
          setError(err.error);
        } else {
          setError('An error occurred during registration. Please try again.');
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
          {/* Show illustration on the left for desktop */}
          {!isMobile && (
            <div className="illustrationContainer page-transition-right">
              <img 
                src="/illustration.png" 
                alt="Signup illustration" 
                className="loginIllustration"
              />
              <div className="illustrationText">
                <h2>Join our community</h2>
                <p>Create your account and get started with your journey</p>
              </div>
            </div>
          )}
        
          <div className="authCard fadeIn page-transition-left">
            <h1 className="formTitle">Create Account</h1>
            <p className="formSubtitle">Join us today and start your journey</p>
            
            {error && (
              <div className="errorMessage mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="staggered-animation-container">
              <div className="formRow">
                <div className="formGroup">
                  <label htmlFor="firstName" className="styledLabel">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    className="styledInput"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John" 
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="formGroup">
                  <label htmlFor="lastName" className="styledLabel">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    className="styledInput"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe" 
                    required 
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
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
              
              <div className="checkboxContainer">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="checkboxInput"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                  disabled={isSubmitting}
                />
                <label htmlFor="terms" className="checkboxLabel">
                  I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                </label>
              </div>
              
              <button 
                type="submit"
                className="styledButton"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
                <span>Sign up with Google</span>
              </button>
              
              <button
                className="socialButton"
                type="button"
                disabled={isSubmitting}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                <span>Sign up with GitHub</span>
              </button>
              
              <div className="linkText">
                Already have an account? <Link to="/login" className="animated-link">Sign in</Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Show illustration below on mobile */}
        {isMobile && (
          <div className="illustrationContainerMobile">
            <img 
              src="/illustration.png" 
              alt="Signup illustration" 
              className="loginIllustrationMobile"
            />
          </div>
        )}
      </div>
    </div>
  );
} 