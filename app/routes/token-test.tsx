import { useState, useEffect } from 'react';
import type { MetaFunction } from "@remix-run/node";
import { Link } from '@remix-run/react';
import { authService } from '../services/auth.service';

export const meta: MetaFunction = () => {
  return [
    { title: "Token Test | My Remix App" },
    { name: "description", content: "Test authentication token" },
  ];
};

export default function TokenTest() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Function to check authentication status
  const checkAuthStatus = () => {
    const isLoggedIn = authService.isLoggedIn();
    setIsAuthenticated(isLoggedIn);
    
    if (isLoggedIn) {
      const user = authService.getCurrentUser();
      setUserData(user);
    } else {
      setUserData(null);
    }
  };
  
  // Set the token manually
  const handleSetToken = () => {
    // Use the default token from the auth service
    authService.setToken();
    checkAuthStatus();
    setTestResult("Token set successfully");
  };
  
  // Test if the token is valid
  const handleTestToken = async () => {
    setLoading(true);
    setTestResult("Testing token...");
    
    try {
      const isValid = await authService.testToken();
      setTestResult(isValid ? "Token is valid! ✓" : "Token is invalid ✗");
    } catch (error) {
      console.error("Error testing token:", error);
      setTestResult("Error testing token");
    } finally {
      setLoading(false);
    }
  };
  
  // Clear the token
  const handleClearToken = () => {
    authService.logout();
    checkAuthStatus();
    setTestResult("Token cleared");
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Authentication Token Test</h1>
        
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          <p className={`font-bold ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
            {isAuthenticated ? '✓ Authenticated' : '✗ Not Authenticated'}
          </p>
          
          {userData && (
            <div className="mt-2">
              <p><span className="font-semibold">Username:</span> {userData.username}</p>
              <p><span className="font-semibold">Email:</span> {userData.email}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-4">
          <button 
            onClick={handleSetToken}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
            disabled={loading}
          >
            Set Default Token
          </button>
          
          <button 
            onClick={handleTestToken}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Token Validity'}
          </button>
          
          <button 
            onClick={handleClearToken}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
            disabled={loading}
          >
            Clear Token
          </button>
        </div>
        
        {testResult && (
          <div className={`mt-6 p-3 rounded text-center ${
            testResult.includes('valid') && !testResult.includes('invalid') 
              ? 'bg-green-100 text-green-800' 
              : testResult.includes('invalid') 
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
          }`}>
            {testResult}
          </div>
        )}
        
        {isAuthenticated && (
          <div className="mt-6 bg-purple-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Access Protected Content</h3>
            <p className="text-purple-700 mb-3">You're authenticated! Now you can access protected routes.</p>
            <Link
              to="/protected"
              className="bg-purple-600 text-white py-2 px-4 rounded inline-flex items-center hover:bg-purple-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Go to Protected Page
            </Link>
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t border-gray-200">
          <Link to="/" className="text-purple-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
} 