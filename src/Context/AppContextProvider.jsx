import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContent = createContext();

const AppContextProvider = (props) => {
  // Get backend URL from environment
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
  axios.defaults.timeout = 30000;
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
      const { data } = await axios.get('/api/auth/is-auth');
      if (data.success && data.userData) {
        setIsLoggedin(true);
        localStorage.setItem('isLoggedin', 'true');
        setUserData(data.userData);
        localStorage.setItem('userData', JSON.stringify(data.userData));
        return true;
      } else {
        clearAuthData();
        return false;
      }
    } catch (error) {
      console.error("Auth check failed:", error.message);
      if (error.response?.status === 401) {
        clearAuthData();
      }
      return false;
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get('/api/auth/is-auth');
      if (data.success && data.userData) {
        setUserData(data.userData);
        localStorage.setItem('userData', JSON.stringify(data.userData));
        return data.userData;
      } else {
        clearAuthData();
        return null;
      }
    } catch (error) {
      console.error('Get user data error:', error);
      if (error.response?.status === 401) {
        clearAuthData();
      }
      return null;
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('isLoggedin');
    localStorage.removeItem('userData');
    setIsLoggedin(false);
    setUserData(null);
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      clearAuthData();
      toast.success("Logged out successfully");
      window.location.href = '/login';
    }
  };

  const login = (userData) => {
    setUserData(userData);
    setIsLoggedin(true);
    localStorage.setItem('isLoggedin', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
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