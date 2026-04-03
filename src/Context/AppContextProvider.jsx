import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContent } from "./AppContext";
import { useEffect } from "react";

const AppContextProvider = (props) => {
  let backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (backendUrl && backendUrl.endsWith('/')) {
    backendUrl = backendUrl.slice(0, -1);
  }
  
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

  // Add token to EVERY request
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle 401 responses
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearAuthData();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  const getAuthState = async () => {
    try {
      const { data } = await axios.get('/api/auth/is-auth');
      if (data.success) {
        setIsLoggedin(true);
        localStorage.setItem('isLoggedin', 'true');
        setUserData(data.userData);
        localStorage.setItem('userData', JSON.stringify(data.userData));
      } else {
        clearAuthData();
      }
    } catch (error) {
      console.error("Auth check failed:", error.message);
      if (error.response?.status === 401) {
        clearAuthData();
      }
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get('/api/user/data');
      if (data.success) {
        setUserData(data.userData);
        localStorage.setItem('userData', JSON.stringify(data.userData));
        return data.userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const clearAuthData = () => {
    console.log('Clearing all auth data');
    localStorage.removeItem('isLoggedin');
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    setIsLoggedin(false);
    setUserData(null);
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
      toast.success("Logged out successfully");
      window.location.href = '/login';
    }
  };

  const login = (userData, token) => {
    console.log('=== LOGIN - Setting new user data ===');
    console.log('New User ID:', userData?._id);
    console.log('New User Email:', userData?.email);
    console.log('New User Balance:', userData?.balance);
    console.log('New User Verified:', userData?.isAccountVerified);
    
    // CRITICAL: Clear ALL old data first
    clearAuthData();
    
    // Then set new data
    setUserData(userData);
    setIsLoggedin(true);
    localStorage.setItem('isLoggedin', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    
    if (token) {
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Verify storage
    console.log('Stored user data:', JSON.parse(localStorage.getItem('userData')));
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
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