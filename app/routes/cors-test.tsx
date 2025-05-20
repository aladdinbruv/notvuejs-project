import { useState, useEffect } from 'react';
import type { MetaFunction } from "@remix-run/node";
import { Link } from '@remix-run/react';
import { authService } from '../services/auth.service';

export const meta: MetaFunction = () => {
  return [
    { title: "CORS Test | My Remix App" },
    { name: "description", content: "Test CORS configuration with Strapi" },
  ];
};

export default function CorsTest() {
  const [baseUrl, setBaseUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [testResults, setTestResults] = useState<Array<{
    endpoint: string;
    success: boolean;
    status?: number;
    message: string;
    headers?: Record<string, string>;
  }>>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<{
    clientIp: string;
    clientOrigin: string;
    clientUserAgent: string;
  }>({
    clientIp: 'Detecting...',
    clientOrigin: '',
    clientUserAgent: '',
  });

  // Initialize data on component mount
  useEffect(() => {
    const authUrl = authService.getAuthUrl();
    const url = authUrl.replace('/api/auth/', '');
    setBaseUrl(url);
    setCustomUrl(url);
    
    // Set client information
    setNetworkInfo({
      clientIp: 'Detecting...',
      clientOrigin: window.location.origin,
      clientUserAgent: navigator.userAgent,
    });
    
    // Try to get client IP from a public API
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        setNetworkInfo(prev => ({
          ...prev,
          clientIp: data.ip || 'Unknown',
        }));
      })
      .catch(() => {
        setNetworkInfo(prev => ({
          ...prev,
          clientIp: 'Detection failed',
        }));
      });
  }, []);

  // Test CORS with different request methods
  const runCorsTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    // Define test endpoints and methods
    const tests = [
      { endpoint: `${customUrl}`, method: 'GET', description: 'Root URL (GET)' },
      { endpoint: `${customUrl}/api`, method: 'GET', description: 'API Info (GET)' },
      { endpoint: `${customUrl}/api/auth/local/register`, method: 'OPTIONS', description: 'Registration Preflight' },
      { endpoint: `${customUrl}/api/users`, method: 'OPTIONS', description: 'Users Preflight' },
    ];
    
    // Run each test sequentially
    for (const test of tests) {
      try {
        const response = await fetch(test.endpoint, {
          method: test.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin,
            'Authorization': 'Bearer f5adea52bdc2ee42eb1550ceab7ed36f333037a08c8dbf7ea844691dd646d80170abf41c08783d83b97b6044d525109af435e59d21d7fc5ee437f70c6d97036a8167d82809e7b4888b738b4f171b33493dfa34c562172b2e94984f3d5e9d90935f0c51340312bc922533c5c94de0c452d4c8238f27c7f63e33878357a980a8c3'
          },
        });
        
        // Extract CORS-related headers
        const headers = Object.fromEntries([...response.headers].filter(([key]) => {
          return key.toLowerCase().includes('access-control') || 
                 key.toLowerCase().includes('allow') ||
                 key.toLowerCase() === 'server';
        }));
        
        setTestResults(prev => [...prev, {
          endpoint: test.endpoint,
          success: true,
          status: response.status,
          message: `${test.description}: ${response.status} ${response.statusText}`,
          headers
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          endpoint: test.endpoint,
          success: false,
          message: `${test.description}: Failed - ${error instanceof Error ? error.message : String(error)}`,
        }]);
      }
    }
    
    setIsTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">CORS Configuration Test</h1>
          <p className="text-gray-600 mb-6">
            This tool tests if your Strapi server is properly configured to accept requests from this application.
          </p>
          
          {/* Network Information */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-800 mb-2">Client Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="font-medium text-blue-700">Client IP:</dt>
                <dd className="text-blue-900">{networkInfo.clientIp}</dd>
              </div>
              <div>
                <dt className="font-medium text-blue-700">Origin:</dt>
                <dd className="text-blue-900 break-all">{networkInfo.clientOrigin}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="font-medium text-blue-700">User Agent:</dt>
                <dd className="text-blue-900 text-xs break-all">{networkInfo.clientUserAgent}</dd>
              </div>
            </dl>
          </div>
          
          {/* Test Form */}
          <div className="mb-6">
            <h2 className="font-semibold mb-2">Test Settings</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strapi Server URL
                </label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://your-strapi-server.com"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Default from auth service: {baseUrl}
                </p>
              </div>
              <div className="self-end">
                <button
                  onClick={runCorsTests}
                  disabled={isTesting}
                  className="w-full md:w-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isTesting ? 'Testing...' : 'Run CORS Tests'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Test Results */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h3 className="font-semibold">CORS Test Results</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {isTesting ? 'Running tests...' : 'No tests run yet. Click "Run CORS Tests" to begin.'}
                </p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {testResults.map((result, index) => (
                    <div key={index} className="p-4">
                      <div className={`flex items-center mb-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        <span className="mr-2">
                          {result.success ? (
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                        <span className="font-medium">{result.message}</span>
                      </div>
                      
                      {result.success && result.headers && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <h4 className="font-medium mb-1 text-gray-700">CORS Headers:</h4>
                          <ul className="space-y-1 text-xs font-mono">
                            {Object.entries(result.headers).length === 0 ? (
                              <li className="text-yellow-600">No CORS headers found</li>
                            ) : (
                              Object.entries(result.headers).map(([key, value], idx) => (
                                <li key={idx}>
                                  <span className="text-indigo-600">{key}:</span> {value}
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      )}
                      
                      {!result.success && (
                        <div className="mt-2 text-sm text-red-600">
                          <p>
                            This error typically indicates a CORS policy issue. Your Strapi server must allow 
                            cross-origin requests from: <code className="font-mono">{networkInfo.clientOrigin}</code>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* CORS Configuration Guide */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">How to Configure CORS in Strapi</h3>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>
                If the tests above fail, you need to configure CORS in your Strapi server:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Open your Strapi project's <code className="font-mono">config/middlewares.js</code> file</li>
                <li>Locate the <code className="font-mono">'strapi::cors'</code> entry</li>
                <li>Replace it with the configuration below, adjusting the origin to include your app</li>
              </ol>
              <div className="bg-white p-3 rounded mt-2 overflow-x-auto">
                <pre className="text-xs font-mono">
{`// In config/middlewares.js
module.exports = [
  // ...other middleware
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: ['http://localhost:3000', '${networkInfo.clientOrigin}']
    }
  },
  // ...other middleware
];`}
                </pre>
              </div>
              <p className="mt-2">
                After making these changes, restart your Strapi server and run the tests again.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <Link to="/" className="text-indigo-600 hover:text-indigo-500">
            Back to Home
          </Link>
          <Link to="/strapi-advanced-debug" className="text-indigo-600 hover:text-indigo-500">
            Go to Advanced Debug Tool
          </Link>
        </div>
      </div>
    </div>
  );
} 