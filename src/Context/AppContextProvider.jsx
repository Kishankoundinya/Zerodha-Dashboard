import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContent } from "./AppContext";
import { useEffect } from "react";

const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
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

  axios.defaults.withCredentials = true; 
  axios.defaults.baseURL = backendUrl;

  const getAuthState = async () => {
    try {
      const { data } = await axios.get('/api/auth/is-auth');
      if (data.success) {
        setIsLoggedin(true);
        localStorage.setItem('isLoggedin', 'true');
        await getUserData();
      } else {
        // Clear if API says not authenticated
        clearAuthData();
      }
    } catch (error) {
      console.error("Auth check failed:", error.message);
      // Don't clear on network errors - keep optimistic state
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get('/api/user/data');
      if (data.success) {
        setUserData(data.userData);
        localStorage.setItem('userData', JSON.stringify(data.userData));
      } else {
        toast.error(data.message);
        clearAuthData();
      }
    } catch (error) {
      // Don't toast for network errors during auto-check
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error(error.message);
      }
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
    }
  };

  const login = async (userData) => {
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