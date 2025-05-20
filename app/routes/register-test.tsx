import { useState, useEffect } from 'react';
import type { MetaFunction } from "@remix-run/node";
import { Link } from '@remix-run/react';
import { authService, type AuthResponse } from '../services/auth.service';

export const meta: MetaFunction = () => {
  return [
    { title: "Registration Test | My Remix App" },
    { name: "description", content: "Test user registration with Strapi" },
  ];
};

export default function RegisterTest() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [requestLog, setRequestLog] = useState<string>('');
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  
  // Add debug message helper function
  const addDebugMessage = (message: string) => {
    setDebugMessages(prev => [...prev, `${new Date().toISOString().slice(11, 19)} - ${message}`]);
    // Also log to console in case developer tools are available
    console.log(`[RegisterTest] ${message}`);
  };
  
  useEffect(() => {
    // Log when component mounts
    addDebugMessage("Component mounted");
    addDebugMessage(`Using Strapi API URL: ${authService.getAuthUrl()}`);
    
    return () => {
      addDebugMessage("Component unmounted");
    };
  }, []);
  
  const handleRegister = async (e: React.FormEvent) => {
    addDebugMessage("Form submitted");
    
    // Very important - prevent form from submitting normally
    e.preventDefault(); 
    addDebugMessage("Default form submission prevented");
    
    if (isSubmitting) {
      addDebugMessage("Already submitting, ignoring duplicate submission");
      return;
    }
    
    addDebugMessage(`Starting registration process for user: ${username}, email: ${email}`);
    
    setIsSubmitting(true);
    setResult(null);
    setRequestLog('Starting registration process...');
    
    try {
      // Log the details being sent (excluding password for security)
      const authUrl = authService.getAuthUrl();
      addDebugMessage(`Auth URL: ${authUrl}`);
      
      // For Strapi v5, the registration endpoint is /api/auth/local/register
      const registerEndpoint = `${authUrl}local/register`;
      addDebugMessage(`Registration endpoint: ${registerEndpoint}`);
      
      setRequestLog(prev => prev + `\nSending request to ${registerEndpoint}`);
      setRequestLog(prev => prev + `\nPayload: { username: "${username}", email: "${email}" }`);
      
      addDebugMessage("Making direct fetch call to Strapi");
      
      // Add a direct fetch call to better understand what's happening
      try {
        const directResponse = await fetch(registerEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer f5adea52bdc2ee42eb1550ceab7ed36f333037a08c8dbf7ea844691dd646d80170abf41c08783d83b97b6044d525109af435e59d21d7fc5ee437f70c6d97036a8167d82809e7b4888b738b4f171b33493dfa34c562172b2e94984f3d5e9d90935f0c51340312bc922533c5c94de0c452d4c8238f27c7f63e33878357a980a8c3'
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        });
        
        addDebugMessage(`Direct fetch response status: ${directResponse.status}`);
        
        // Get the raw response text first for debugging
        const rawText = await directResponse.text();
        addDebugMessage(`Raw response text: ${rawText.substring(0, 500)}`);
        setRequestLog(prev => prev + `\nRaw response text: ${rawText.substring(0, 500)}`);
        
        // Try to parse as JSON
        let directData: Partial<AuthResponse>;
        try {
          directData = JSON.parse(rawText);
          addDebugMessage(`Direct fetch successful: ${JSON.stringify(directData).substring(0, 100)}...`);
          
          // If we got here, we successfully registered!
          setResult({
            success: true,
            message: `Registration successful! Welcome ${directData.user?.username || username}`
          });
          
          // Store the JWT token in localStorage
          if (directData.jwt) {
            localStorage.setItem('token', directData.jwt);
            localStorage.setItem('user', JSON.stringify(directData.user));
            addDebugMessage("Token stored in localStorage");
          }
          
          setRequestLog(prev => prev + `\nRegistration successful!`);
          setRequestLog(prev => prev + `\nReceived user: ${directData.user?.username || username}`);
          
        } catch (parseError) {
          addDebugMessage("Could not parse direct fetch response as JSON");
          
          if (!directResponse.ok) {
            setResult({
              success: false,
              message: `Registration failed with status: ${directResponse.status}. Check the request log for details.`
            });
          }
        }
      } catch (directError) {
        addDebugMessage(`Direct fetch error: ${directError instanceof Error ? directError.message : String(directError)}`);
        
        setRequestLog(prev => prev + `\nDirect fetch error:`);
        setRequestLog(prev => prev + `\n${directError instanceof Error ? directError.message : String(directError)}`);
        
        // Try the original authService call as fallback
        addDebugMessage("Falling back to authService.register()");
        try {
          const response = await authService.register(username, email, password);
          
          addDebugMessage("Registration successful via authService");
          
          setResult({
            success: true,
            message: `Registration successful! Welcome ${response.user.username}`
          });
          
          setRequestLog(prev => prev + `\nRegistration successful via authService!`);
        } catch (serviceError) {
          addDebugMessage(`authService registration failed: ${serviceError instanceof Error ? serviceError.message : String(serviceError)}`);
          
          // Handle Strapi error responses
          let errorMessage = 'An unknown error occurred during registration';
          
          if (typeof serviceError === 'object' && serviceError !== null) {
            if ('message' in serviceError && typeof serviceError.message !== 'undefined') {
              if (Array.isArray(serviceError.message)) {
                errorMessage = serviceError.message[0];
              } else if (typeof serviceError.message === 'string') {
                errorMessage = serviceError.message;
              }
            } else if ('error' in serviceError && typeof serviceError.error === 'string') {
              errorMessage = serviceError.error;
            }
          }
          
          setResult({
            success: false,
            message: errorMessage
          });
        }
      }
    } catch (error) {
      addDebugMessage(`Registration process failed with error: ${error instanceof Error ? error.message : String(error)}`);
      
      // Log error details
      setRequestLog(prev => prev + `\nRegistration failed with error:`);
      setRequestLog(prev => prev + `\n${JSON.stringify(error, null, 2)}`);
      
      // Handle Strapi error responses
      let errorMessage = 'An unknown error occurred during registration';
      
      if (typeof error === 'object' && error !== null) {
        if ('message' in error && typeof error.message !== 'undefined') {
          if (Array.isArray(error.message)) {
            errorMessage = error.message[0];
          } else if (typeof error.message === 'string') {
            errorMessage = error.message;
          }
        } else if ('error' in error && typeof error.error === 'string') {
          errorMessage = error.error;
        }
      }
      
      setResult({
        success: false,
        message: errorMessage
      });
    } finally {
      addDebugMessage("Registration process completed");
      setIsSubmitting(false);
    }
  };
  
  // Test a direct API call to check for CORS issues
  const testApiConnection = async () => {
    addDebugMessage("Testing API connection");
    setIsTesting(true);
    setRequestLog('Testing direct API connection to Strapi...');
    
    try {
      // Test a simple GET request to the Strapi server
      const authUrl = authService.getAuthUrl(); 
      const baseUrl = authUrl.replace('/api/auth/', '');
      
      addDebugMessage(`Testing connection to: ${baseUrl}`);
      setRequestLog(prev => prev + `\nSending GET request to ${baseUrl}`);
      
      // Test endpoints specifically for Strapi v5
      const endpoints = [
        { url: baseUrl, description: 'Base URL' },
        { url: `${baseUrl}/api`, description: 'API Base' },
        { url: `${baseUrl}/api/auth/local/register`, description: 'Registration Endpoint' }
      ];
      
      for (const endpoint of endpoints) {
        addDebugMessage(`Testing endpoint: ${endpoint.url}`);
        setRequestLog(prev => prev + `\n\nTesting endpoint: ${endpoint.url} (${endpoint.description})`);
        
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer f5adea52bdc2ee42eb1550ceab7ed36f333037a08c8dbf7ea844691dd646d80170abf41c08783d83b97b6044d525109af435e59d21d7fc5ee437f70c6d97036a8167d82809e7b4888b738b4f171b33493dfa34c562172b2e94984f3d5e9d90935f0c51340312bc922533c5c94de0c452d4c8238f27c7f63e33878357a980a8c3'
          },
          mode: 'cors'
        });
        
        addDebugMessage(`Response status for ${endpoint.description}: ${response.status}`);
        setRequestLog(prev => prev + `\nResponse status: ${response.status}`);
        
        // Add response headers to the log
        const headerInfo = Object.fromEntries([...response.headers]);
        setRequestLog(prev => prev + `\nResponse headers: ${JSON.stringify(headerInfo, null, 2)}`);
        
        try {
          const text = await response.text();
          addDebugMessage(`Response text preview: ${text.substring(0, 100)}`);
          setRequestLog(prev => prev + `\nResponse text: ${text.substring(0, 100)}...`);
        } catch (textError) {
          addDebugMessage(`Failed to read response text: ${textError}`);
          setRequestLog(prev => prev + `\nFailed to read response text: ${textError}`);
        }
      }
      
      setResult({
        success: true,
        message: 'API connection tests completed. See log for details.'
      });
    } catch (error) {
      addDebugMessage(`API test failed: ${error instanceof Error ? error.message : String(error)}`);
      
      setRequestLog(prev => prev + `\nAPI test failed with error:`);
      setRequestLog(prev => prev + `\n${error instanceof Error ? error.message : String(error)}`);
      
      setResult({
        success: false,
        message: 'API connection failed! This might be a CORS issue. See the request log for details.'
      });
    } finally {
      addDebugMessage("API connection test completed");
      setIsTesting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Strapi v5 Registration Test</h1>
        
        {/* Debug messages */}
        {debugMessages.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Debug Log:</h3>
            <ul className="text-xs text-blue-700 list-disc pl-4 max-h-40 overflow-auto">
              {debugMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                addDebugMessage(`Username changed: ${e.target.value}`);
                setUsername(e.target.value);
              }}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                addDebugMessage(`Email changed: ${e.target.value}`);
                setEmail(e.target.value);
              }}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                addDebugMessage(`Password changed (length): ${e.target.value.length}`);
                setPassword(e.target.value);
              }}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={() => {
                addDebugMessage("Submit button clicked");
              }}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register User'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                addDebugMessage("Test API button clicked");
                testApiConnection();
              }}
              disabled={isTesting}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isTesting ? 'Testing...' : 'Test API Connection'}
            </button>
          </div>
        </form>
        
        {result && (
          <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {result.message}
          </div>
        )}
        
        {requestLog && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Request Log:</h3>
            <pre className="text-xs whitespace-pre-wrap text-gray-700 overflow-auto max-h-40">
              {requestLog}
            </pre>
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          <Link to="/" className="text-indigo-600 hover:text-indigo-500">
            Back to Home
          </Link>
          <Link to="/token-test" className="text-indigo-600 hover:text-indigo-500">
            Token Test Page
          </Link>
        </div>
        
        <div className="mt-6 bg-yellow-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Strapi v5 Registration Notes</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This page tests registration with Strapi v5.13.0. The registration endpoint is now:
                  <code className="ml-1 text-xs bg-yellow-100 p-1 rounded">/api/auth/local/register</code>
                </p>
                <p className="mt-1">
                  All requests include the Authorization header with the provided token.
                </p>
                <p className="mt-1">
                  <strong>DEBUG INFO:</strong> Debug log is displayed at the top of this form.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 