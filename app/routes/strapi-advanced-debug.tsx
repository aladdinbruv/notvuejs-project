import { useState, useEffect } from 'react';
import type { MetaFunction } from "@remix-run/node";
import { Link } from '@remix-run/react';
import { authService } from '../services/auth.service';

export const meta: MetaFunction = () => {
  return [
    { title: "Strapi Advanced Debug | My Remix App" },
    { name: "description", content: "Advanced debugging for Strapi API integration" },
  ];
};

export default function StrapiAdvancedDebug() {
  // Form state
  const [username, setUsername] = useState('test-user-adv');
  const [email, setEmail] = useState('testuser-adv@example.com');
  const [password, setPassword] = useState('Password123!');
  
  // Operation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('default');
  const [selectedMethod, setSelectedMethod] = useState('register');
  
  // Debug state
  const [debugOutput, setDebugOutput] = useState<Array<{
    timestamp: string;
    type: 'info' | 'error' | 'success' | 'warning';
    message: string;
    details?: any;
  }>>([]);
  
  // Connection info
  const [connectionInfo, setConnectionInfo] = useState<{
    baseUrl: string;
    authUrl: string;
    strapiVersion: string;
  }>({
    baseUrl: '',
    authUrl: '',
    strapiVersion: '',
  });
  
  // Add debug log entry
  const addLog = (type: 'info' | 'error' | 'success' | 'warning', message: string, details?: any) => {
    const timestamp = new Date().toISOString().slice(11, 23);
    console.log(`[${type.toUpperCase()}] ${message}`, details);
    
    setDebugOutput(prev => [
      {
        timestamp,
        type,
        message,
        details
      },
      ...prev
    ]);
  };
  
  // Initialize on mount
  useEffect(() => {
    addLog('info', 'Debug page initialized');
    
    // Get connection information
    const authUrl = authService.getAuthUrl();
    const baseUrl = authUrl.replace('/api/auth/', '');
    
    // Attempt to determine Strapi version
    determineApiDetails(baseUrl);
    
    setConnectionInfo({
      baseUrl,
      authUrl,
      strapiVersion: 'Detecting...',
    });
  }, []);
  
  // Attempt to determine Strapi API details
  const determineApiDetails = async (baseUrl: string) => {
    try {
      addLog('info', `Detecting Strapi details from: ${baseUrl}`);
      
      // Try to fetch API info
      const response = await fetch(`${baseUrl}/api`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer f5adea52bdc2ee42eb1550ceab7ed36f333037a08c8dbf7ea844691dd646d80170abf41c08783d83b97b6044d525109af435e59d21d7fc5ee437f70c6d97036a8167d82809e7b4888b738b4f171b33493dfa34c562172b2e94984f3d5e9d90935f0c51340312bc922533c5c94de0c452d4c8238f27c7f63e33878357a980a8c3'
        },
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          addLog('success', 'API info retrieved successfully', data);
          
          setConnectionInfo(prev => ({
            ...prev,
            strapiVersion: data.strapiVersion || 'Unknown',
          }));
        } catch (error) {
          const text = await response.text();
          addLog('warning', 'Could not parse API response as JSON', { text: text.substring(0, 200) });
        }
      } else {
        addLog('warning', `API info endpoint returned ${response.status}`, { statusText: response.statusText });
        
        // Try fallback to root URL
        try {
          const rootResponse = await fetch(baseUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Authorization': 'Bearer f5adea52bdc2ee42eb1550ceab7ed36f333037a08c8dbf7ea844691dd646d80170abf41c08783d83b97b6044d525109af435e59d21d7fc5ee437f70c6d97036a8167d82809e7b4888b738b4f171b33493dfa34c562172b2e94984f3d5e9d90935f0c51340312bc922533c5c94de0c452d4c8238f27c7f63e33878357a980a8c3'
            },
          });
          
          addLog('info', `Root URL response: ${rootResponse.status}`, { statusText: rootResponse.statusText });
          
          // Check response headers for server info
          const headers = Object.fromEntries([...rootResponse.headers]);
          addLog('info', 'Server headers:', headers);
          
          // If we get here, the server is reachable
          setConnectionInfo(prev => ({
            ...prev,
            strapiVersion: headers['server'] || 'Unknown (Server reachable)',
          }));
        } catch (rootError) {
          addLog('error', 'Failed to connect to API root', rootError);
          
          setConnectionInfo(prev => ({
            ...prev,
            strapiVersion: 'Unknown (Connection failed)',
          }));
        }
      }
    } catch (error) {
      addLog('error', 'Failed to detect API details', error);
      
      setConnectionInfo(prev => ({
        ...prev,
        strapiVersion: 'Detection failed',
      }));
    }
  };
  
  // Get the registration endpoint based on selection
  const getEndpoint = () => {
    const { baseUrl, authUrl } = connectionInfo;
    
    switch (selectedEndpoint) {
      case 'v3':
        return `${baseUrl}/auth/local/register`;
      case 'v4':
        return `${baseUrl}/api/auth/local/register`;
      case 'v4alt':
        return `${baseUrl}/api/users`;
      case 'v5':
        return `${baseUrl}/api/auth/local/register`;
      case 'v5callback':
        return `${baseUrl}/api/auth/local/callback`;
      case 'fullUrl':
        // The endpoint is fully specified by the user
        return baseUrl;
      case 'default':
      default:
        return `${authUrl}local/register`;
    }
  };
  
  // Format request payload based on selected method and endpoint
  const getRequestPayload = () => {
    if (selectedMethod === 'register') {
      return {
        username,
        email,
        password,
      };
    } else if (selectedMethod === 'login') {
      return {
        identifier: email,
        password,
      };
    } else {
      return {};
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    addLog('info', 'Starting API request process');
    
    const endpoint = getEndpoint();
    const payload = getRequestPayload();
    
    addLog('info', `Using endpoint: ${endpoint}`);
    addLog('info', 'Request payload:', {
      ...payload,
      password: '********', // Mask password in logs
    });
    
    try {
      // Try direct fetch with detailed logging
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer f5adea52bdc2ee42eb1550ceab7ed36f333037a08c8dbf7ea844691dd646d80170abf41c08783d83b97b6044d525109af435e59d21d7fc5ee437f70c6d97036a8167d82809e7b4888b738b4f171b33493dfa34c562172b2e94984f3d5e9d90935f0c51340312bc922533c5c94de0c452d4c8238f27c7f63e33878357a980a8c3'
        },
        body: JSON.stringify(payload),
      });
      
      addLog('info', `Response status: ${response.status} ${response.statusText}`);
      addLog('info', 'Response headers:', Object.fromEntries([...response.headers]));
      
      try {
        const data = await response.json();
        addLog(response.ok ? 'success' : 'error', 'Response data:', data);
        
        if (response.ok) {
          // Store token if we got a successful response with jwt
          if (data.jwt) {
            localStorage.setItem('token', data.jwt);
            localStorage.setItem('user', JSON.stringify(data.user));
            addLog('success', 'Token stored in localStorage');
          } else {
            addLog('warning', 'No JWT token in successful response');
          }
        }
      } catch (parseError) {
        // Try to get text response if JSON parsing fails
        try {
          const text = await response.text();
          addLog('warning', 'Response is not valid JSON', { text: text.substring(0, 500) });
        } catch (textError) {
          addLog('error', 'Failed to read response body', textError);
        }
      }
    } catch (fetchError) {
      addLog('error', 'Fetch operation failed', fetchError);
      
      // Try to identify common errors
      if (fetchError instanceof Error) {
        if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
          addLog('error', 'Network error - Could not connect to the server. Possible causes:');
          addLog('info', '1. Server is down or unreachable');
          addLog('info', '2. CORS is not configured correctly on the server');
          addLog('info', '3. Network connectivity issues');
        } else if (fetchError.message.includes('CORS')) {
          addLog('error', 'CORS Policy Error - Server rejected the cross-origin request');
          addLog('info', 'The Strapi server needs to allow requests from this origin:');
          addLog('info', `Origin: ${window.location.origin}`);
        }
      }
    } finally {
      setIsSubmitting(false);
      addLog('info', 'Request process completed');
    }
  };
  
  // Render the debug interface
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Strapi Advanced Debug Tool</h1>
          <p className="text-gray-600 mb-6">
            This tool provides comprehensive testing of Strapi API endpoints with detailed diagnostics.
          </p>
          
          {/* Connection Information */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-800 mb-2">Connection Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="font-medium text-blue-700">Base URL:</dt>
                <dd className="text-blue-900 break-all">{connectionInfo.baseUrl}</dd>
              </div>
              <div>
                <dt className="font-medium text-blue-700">Auth URL:</dt>
                <dd className="text-blue-900 break-all">{connectionInfo.authUrl}</dd>
              </div>
              <div>
                <dt className="font-medium text-blue-700">Strapi Version:</dt>
                <dd className="text-blue-900 break-all">{connectionInfo.strapiVersion}</dd>
              </div>
            </dl>
          </div>
          
          {/* API Test Form */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Operation Settings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Operation Settings</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Method
                  </label>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="register">Register User</option>
                    <option value="login">Login User</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endpoint Format
                  </label>
                  <select
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="default">Default (from auth service)</option>
                    <option value="v3">Strapi v3 format (/auth/local/register)</option>
                    <option value="v4">Strapi v4 format (/api/auth/local/register)</option>
                    <option value="v4alt">Strapi v4 alt (/api/users)</option>
                    <option value="v5">Strapi v5 format (/api/auth/local/register)</option>
                    <option value="v5callback">Strapi v5 callback (/api/auth/local/callback)</option>
                    <option value="fullUrl">Use Base URL as full endpoint</option>
                  </select>
                </div>
              </div>
              
              {/* User Data */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">User Data</h3>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : `Send ${selectedMethod === 'register' ? 'Registration' : 'Login'} Request`}
            </button>
          </form>
          
          {/* Debug Output */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
              <h3 className="font-semibold">Debug Log</h3>
              <button 
                onClick={() => setDebugOutput([])}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Clear Log
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto p-2">
              {debugOutput.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No log entries yet. Run a test to see results.</p>
              ) : (
                <div className="space-y-2">
                  {debugOutput.map((entry, index) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded text-sm ${
                        entry.type === 'error' ? 'bg-red-50 text-red-800' :
                        entry.type === 'success' ? 'bg-green-50 text-green-800' :
                        entry.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                        'bg-blue-50 text-blue-800'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="text-xs font-mono opacity-70">{entry.timestamp}</span>
                        <span className="ml-2">{entry.message}</span>
                      </div>
                      
                      {entry.details && (
                        <pre className="mt-1 text-xs font-mono bg-white bg-opacity-50 p-2 rounded overflow-auto max-h-32">
                          {typeof entry.details === 'string' 
                            ? entry.details
                            : JSON.stringify(entry.details, null, 2)
                          }
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Troubleshooting Tips</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Common Issues:</h3>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>
                  <strong>CORS Errors:</strong> Ensure your Strapi server has CORS configured to allow requests from {window.location?.origin || 'your application origin'}.
                </li>
                <li>
                  <strong>Endpoint Format:</strong> Different Strapi versions use different API endpoints. Try various formats from the dropdown.
                </li>
                <li>
                  <strong>Authentication:</strong> Check if the Strapi instance requires authentication for user registration.
                </li>
                <li>
                  <strong>Network Issues:</strong> Verify your Strapi server is running and accessible from your current network.
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">Strapi API Endpoints:</h3>
              <ul className="text-sm pl-5 mt-2 space-y-1">
                <li><strong>Strapi v5:</strong> /api/auth/local/register (registration), /api/auth/local/callback (login)</li>
                <li><strong>Strapi v4:</strong> /api/auth/local/register (registration), /api/auth/local (login)</li>
                <li><strong>Strapi v3:</strong> /auth/local/register (registration), /auth/local (login)</li>
                <li><strong>Current URL being used:</strong> {connectionInfo.authUrl}local/register</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg">Strapi v5.13.0 Notes:</h3>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>
                  <strong>API Changes:</strong> Strapi v5 uses <code className="font-mono text-xs bg-gray-100 p-1">/api/auth/local/callback</code> for login instead of <code className="font-mono text-xs bg-gray-100 p-1">/api/auth/local</code>.
                </li>
                <li>
                  <strong>Authentication:</strong> Strapi v5 may enforce stricter permissions. Make sure your token has the necessary permissions.
                </li>
                <li>
                  <strong>Error Handling:</strong> Strapi v5 might return error messages in a different format.
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Link to="/" className="text-indigo-600 hover:text-indigo-500">
              Back to Home
            </Link>
            <Link to="/register-test" className="text-indigo-600 hover:text-indigo-500">
              Go to Simple Registration Test
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 