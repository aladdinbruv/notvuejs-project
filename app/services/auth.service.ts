import axios from 'axios';

// Define your Strapi API URL here
const API_BASE_URL = 'https://big-creativity-8aeca3e09b.strapiapp.com';
// Updated to match Strapi v5 API format
const AUTH_URL = `${API_BASE_URL}/api/auth/`;

// Default access token (for testing purposes)
const DEFAULT_TOKEN = "f5adea52bdc2ee42eb1550ceab7ed36f333037a08c8dbf7ea844691dd646d80170abf41c08783d83b97b6044d525109af435e59d21d7fc5ee437f70c6d97036a8167d82809e7b4888b738b4f171b33493dfa34c562172b2e94984f3d5e9d90935f0c51340312bc922533c5c94de0c452d4c8238f27c7f63e33878357a980a8c3";

// Enable debug logging
const DEBUG = true;

// Logger function with proper typing
const log = (message: string, data?: unknown) => {
  if (DEBUG) {
    if (data) {
      console.log(`🔒 Auth Service: ${message}`, data);
    } else {
      console.log(`🔒 Auth Service: ${message}`);
    }
  }
};

// Create an axios instance with authorization header
const createAuthAxios = (token: string) => {
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Create a default axios instance that always includes the authorization token
const defaultAuthAxios = axios.create();
defaultAuthAxios.interceptors.request.use(config => {
  // Always include the auth token in the request header
  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${DEFAULT_TOKEN}`;
  
  if (DEBUG) {
    log('Using authorization header with default token');
  }
  return config;
});

// Define interfaces for authentication responses
export interface User {
  id: number;
  username: string;
  email: string;
  provider: string;
  resetPasswordToken?: string;
  confirmationToken?: string;
  confirmed: boolean;
  blocked: boolean;
  role?: {
    id: number;
    name: string;
    description?: string;
    type?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface AuthError {
  statusCode: number;
  error: string;
  message: string[];
}

// Authentication service functions
export const authService = {
  // Get authentication URL
  getAuthUrl(): string {
    return AUTH_URL;
  },
  
  // Login with Strapi
  async login(identifier: string, password: string): Promise<AuthResponse> {
    try {
      log(`Attempting login for user: ${identifier}`);
      log(`API endpoint: ${AUTH_URL}local/callback`); // Updated for Strapi v5
      
      // Add request interceptor for debugging
      const instance = axios.create();
      instance.interceptors.request.use(request => {
        // Add the default authorization header
        request.headers = request.headers || {};
        request.headers.Authorization = `Bearer ${DEFAULT_TOKEN}`;
        
        log('Request details:', {
          url: request.url,
          method: request.method,
          data: request.data,
          headers: request.headers
        });
        return request;
      });
      
      // Updated to match Strapi v5 login endpoint
      const response = await instance.post(`${AUTH_URL}local/callback`, {
        identifier,
        password,
      });
      
      log('Login successful', { user: response.data.user });
      
      // Store the JWT token in localStorage
      if (response.data.jwt) {
        localStorage.setItem('token', response.data.jwt);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        log('Token stored in localStorage');
      }
      
      return response.data;
    } catch (error) {
      log('Login error occurred:', error);
      if (axios.isAxiosError(error) && error.response) {
        log('Server response error:', error.response.data);
        throw error.response.data;
      }
      throw error;
    }
  },
  
  // Register with Strapi
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      // Updated for Strapi v5
      const registerEndpoint = `${AUTH_URL}local/register`;
      log(`Attempting to register user: ${email} with username: ${username}`);
      log(`API endpoint: ${registerEndpoint}`);
      
      // Log detailed request information
      log('Registration payload:', { username, email });
      
      // Create custom axios instance with request logging
      const instance = axios.create();
      instance.interceptors.request.use(request => {
        // Add the default authorization header
        request.headers = request.headers || {};
        request.headers.Authorization = `Bearer ${DEFAULT_TOKEN}`;
        
        log('Registration request details:', {
          url: request.url,
          method: request.method,
          data: request.data,
          headers: request.headers
        });
        return request;
      });
      
      instance.interceptors.response.use(
        response => {
          log('Registration response:', response.data);
          return response;
        },
        error => {
          log('Registration response error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });
          return Promise.reject(error);
        }
      );
      
      // Attempt with direct fetch first for better debugging
      log('Attempting registration with direct fetch first');
      try {
        const fetchResponse = await fetch(registerEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEFAULT_TOKEN}`
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        });
        
        log(`Direct fetch response status: ${fetchResponse.status}`);
        
        const responseText = await fetchResponse.text();
        log('Raw response:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
          log('Parsed JSON response:', data);
        } catch (e) {
          log('Response is not valid JSON');
        }
        
        if (!fetchResponse.ok) {
          throw new Error(`Registration failed with status: ${fetchResponse.status}`);
        }
        
        if (data) {
          // Store the JWT token in localStorage
          if (data.jwt) {
            localStorage.setItem('token', data.jwt);
            localStorage.setItem('user', JSON.stringify(data.user));
            log('Token stored in localStorage');
          }
          
          return data;
        }
      } catch (fetchError) {
        log('Fetch attempt failed, falling back to axios:', fetchError);
      }
      
      // Fall back to axios if fetch fails
      const response = await instance.post(registerEndpoint, {
        username,
        email,
        password,
      });
      
      log('Registration successful', { user: response.data.user });
      
      // Store the JWT token in localStorage
      if (response.data.jwt) {
        localStorage.setItem('token', response.data.jwt);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        log('Token stored in localStorage');
      }
      
      return response.data;
    } catch (error) {
      log('Registration error occurred:', error);
      if (axios.isAxiosError(error) && error.response) {
        log('Server response error:', error.response.data);
        throw error.response.data;
      }
      throw error;
    }
  },
  
  // Manually set token (for testing purposes)
  setToken(token: string = DEFAULT_TOKEN, userData: Partial<User> = {}): void {
    log('Manually setting token:', token.substring(0, 10) + '...');
    localStorage.setItem('token', token);
    
    // Create minimal user data if not provided
    const defaultUser: Partial<User> = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      provider: 'local',
      confirmed: true,
      blocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userData
    };
    
    localStorage.setItem('user', JSON.stringify(defaultUser));
    log('User data stored in localStorage', defaultUser);
  },
  
  // Test token validity
  async testToken(token?: string): Promise<boolean> {
    try {
      log('Testing token validity');
      // Use provided token, or get it from storage, or use default
      const tokenToUse = token || authService.getToken() || DEFAULT_TOKEN;
      const authAxios = createAuthAxios(tokenToUse);
      
      // Updated to match Strapi v5 users/me endpoint
      const response = await authAxios.get(`${API_BASE_URL}/api/users/me`);
      log('Token is valid, user data:', response.data);
      return true;
    } catch (error) {
      log('Token test failed:', error);
      return false;
    }
  },
  
  // Logout
  logout(): void {
    log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    log('User logged out successfully');
  },
  
  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        log('Retrieved current user from localStorage', user);
        return user;
      } catch (e) {
        log('Error parsing user from localStorage', e);
        return null;
      }
    }
    log('No user found in localStorage');
    return null;
  },
  
  // Check if user is logged in
  isLoggedIn(): boolean {
    const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('token');
    log(`User is logged in: ${isLoggedIn}`);
    return isLoggedIn;
  },
  
  // Get JWT token
  getToken(): string | null {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    log(`Retrieved token: ${token ? 'Token exists' : 'No token found'}`);
    return token;
  },

  // Send password reset request
  async forgotPassword(email: string): Promise<unknown> {
    try {
      log(`Attempting password reset for: ${email}`);
      log(`API endpoint: ${AUTH_URL}forgot-password`);
      
      // Use the default authorized instance
      const response = await defaultAuthAxios.post(`${AUTH_URL}forgot-password`, {
        email,
      });
      
      log('Password reset request successful', response.data);
      return response.data;
    } catch (error) {
      log('Password reset error occurred:', error);
      if (axios.isAxiosError(error) && error.response) {
        log('Server response error:', error.response.data);
        throw error.response.data;
      }
      throw error;
    }
  },
}; 