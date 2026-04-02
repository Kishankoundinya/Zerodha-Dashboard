import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContent } from "./AppContext";
import { useEffect } from "react";

const AppContextProvider = (props) => {
  // Fix: Remove trailing slash from backendUrl if it exists
  let backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (backendUrl && backendUrl.endsWith('/')) {
    backendUrl = backendUrl.slice(0, -1);
  }
  
  // Initialize from localStorage for immediate access
  const [isLoggedin, setIsLoggedin] = useState(() => {
    return localStorage.getItem('isLoggedin') === 'true';
  });
  
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('userData');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Configure axios defaults
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = backendUrl;
  axios.defaults.timeout = 30000; // 30 second timeout
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  // Add request interceptor for debugging
  axios.interceptors.request.use(
    (config) => {
      console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for debugging
  axios.interceptors.response.use(
    (response) => {
      console.log(`Response from ${response.config.url}:`, response.status);
      return response;
    },
    (error) => {
      console.error(`API Error for ${error.config?.url}:`, error.message);
      return Promise.reject(error);
    }
  );

  const getAuthState = async () => {
    try {
      const { data } = await axios.get('/api/auth/is-auth', { withCredentials: true });
      if (data.success) {
        setIsLoggedin(true);
        localStorage.setItem('isLoggedin', 'true');
        await getUserData(); // Fetch fresh user data
      } else {
        // Clear if API says not authenticated
        clearAuthData();
      }
    } catch (error) {
      console.error("Auth check failed:", error.message);
      // Don't clear on network errors - keep optimistic state
      if (error.response?.status === 401) {
        // Unauthorized - clear auth data
        clearAuthData();
      }
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get('/api/user/data', { withCredentials: true });
      if (data.success) {
        setUserData(data.userData);
        localStorage.setItem('userData', JSON.stringify(data.userData));
        return data.userData;
      } else {
        toast.error(data.message);
        clearAuthData();
        return null;
      }
    } catch (error) {
      // Don't toast for network errors during auto-check
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error(error.message);
      }
      if (error.response?.status === 401) {
        clearAuthData();
      }
      return null;
    }
  };

  const clearAuthData = () => {
    // Clear all user-related data from localStorage
    localStorage.removeItem('isLoggedin');
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken'); // Clear any token if stored
    localStorage.removeItem('holdings'); // Clear cached holdings
    localStorage.removeItem('transactions'); // Clear cached transactions
    
    // Clear sessionStorage if used
    sessionStorage.clear();
    
    setIsLoggedin(false);
    setUserData(null);
    
    console.log('All auth data cleared');
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout API error:", error);
      toast.error("Error during logout");
    } finally {
      clearAuthData();
      // Force redirect to login
      window.location.href = '/login';
    }
  };

  // UPDATED: Login function that fetches fresh data from backend
  const login = async (email, password) => {
    try {
      console.log('Logging in with:', email);
      
      const { data } = await axios.post('/api/auth/login', 
        { email, password },
        { withCredentials: true }
      );
      
      console.log('Login response:', data);
      
      if (data.success) {
        // Clear old data first
        clearAuthData();
        
        // Store new user data
        if (data.userData) {
          setUserData(data.userData);
          localStorage.setItem('userData', JSON.stringify(data.userData));
        }
        
        setIsLoggedin(true);
        localStorage.setItem('isLoggedin', 'true');
        
        // Fetch fresh user data to ensure everything is up to date
        await getUserData();
        
        toast.success('Login successful!');
        return true;
      } else {
        toast.error(data.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMsg);
      return false;
    }
  };

  // Check auth on mount if we think we're logged in
  useEffect(() => {
    if (isLoggedin || localStorage.getItem('isLoggedin') === 'true') {
      getAuthState();
    }
  }, []);

  const value = {
    backendUrl, 
    isLoggedin, 
    setIsLoggedin, 
    userData, 
    setUserData, 
    getUserData,
    logout,
    login,
    clearAuthData
  };

  return (
    <AppContent.Provider value={value}>
      {props.children}
    </AppContent.Provider>
  );
};

export default AppContextProvider;