import { useState, useEffect } from 'react';
import type { MetaFunction } from "@remix-run/node";
import { Link, useNavigate } from '@remix-run/react';
import { authService } from '../services/auth.service';

export const meta: MetaFunction = () => {
  return [
    { title: "Protected Route | My Remix App" },
    { name: "description", content: "Protected route example" },
  ];
};

export default function Protected() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      try {
        // First, check if we have a token
        if (!authService.isLoggedIn()) {
          console.log('No token found, redirecting to login');
          navigate('/token-test');
          return;
        }
        
        // Test if the token is valid
        const isValid = await authService.testToken();
        if (!isValid) {
          console.log('Invalid token, redirecting to login');
          // Clear the invalid token
          authService.logout();
          navigate('/token-test');
          return;
        }
        
        // Get user info
        const userData = authService.getCurrentUser();
        console.log('User authenticated:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/token-test');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-purple-600 p-6 text-white">
          <h1 className="text-3xl font-bold">Protected Page</h1>
          <p className="mt-2 opacity-80">This page is only accessible with a valid authentication token</p>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <div className="bg-green-100 p-4 rounded-lg border border-green-200 mb-6">
              <div className="flex items-center text-green-700 mb-2">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h2 className="text-xl font-bold">Authentication Successful</h2>
              </div>
              <p>You have successfully authenticated with your Strapi token!</p>
            </div>
            
            <h2 className="text-xl font-bold mb-4">Your Profile Information</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              {user ? (
                <div className="space-y-2">
                  <p><span className="font-semibold">Username:</span> {user.username}</p>
                  <p><span className="font-semibold">Email:</span> {user.email}</p>
                  <p><span className="font-semibold">ID:</span> {user.id}</p>
                  {user.createdAt && (
                    <p><span className="font-semibold">Joined:</span> {new Date(user.createdAt).toLocaleString()}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No user information available</p>
              )}
            </div>
            
            <h2 className="text-xl font-bold mb-4">What You Can Do</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>This route demonstrates token-based authentication</li>
              <li>Any route can implement this pattern to protect content</li>
              <li>Token validation happens on every page load</li>
              <li>Invalid or missing tokens redirect to the login page</li>
            </ul>
          </div>
          
          <div className="flex space-x-4">
            <Link 
              to="/"
              className="text-gray-600 hover:text-gray-800 hover:underline flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Home
            </Link>
            
            <Link 
              to="/token-test"
              className="text-purple-600 hover:text-purple-800 hover:underline flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
              Manage Token
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 