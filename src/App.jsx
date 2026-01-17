import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './Pages/Login';
import EmailVerify from './Pages/EmailVerify';
import ResetPassword from './Pages/ResetPassword';
import Landing from './Pages/Landing';
import Home from './Pages/Home';
import Positions from './Component/Positions';
import Header from './Component/Header';
import Orders from './Component/Orders';
import Holdings from './Component/Holdings';
import Funds from './Component/Funds';
import { AppContent } from './Context/AppContext';


const ProtectedRoute = ({ children }) => {
  const { userData } = useContext(AppContent);
  

  const isAuthenticated = userData || localStorage.getItem('userData');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};


const PublicRoute = ({ children }) => {
  const { userData } = useContext(AppContent);
  const isAuthenticated = userData || localStorage.getItem('userData');
  
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>

        <Route path="/" element={<Landing />} />
        
        <Route 
          path="/login" 
          element={<Login />} />
        
        <Route 
          path="/email-verify" 
          element={<EmailVerify />} />
        
        <Route 
          path="/reset-password" 
          element={<ResetPassword />} />


        <Route 
          path="/home" 
          element={<Home />}>
          <Route index element={<Header />} />
          <Route path="orders" element={<Orders />} />
          <Route path="positions" element={<Positions />} />
          <Route path="holdings" element={<Holdings />} />
          <Route path="funds" element={<Funds />} />
        </Route>

        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;