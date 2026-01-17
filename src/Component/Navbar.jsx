import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContent } from '../Context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import verifiedlogo from '../assets/Images/verified.svg'

const Navbar = () => {
  const navigate = useNavigate()
  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContent)

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp')
      if (data.success) {
        navigate('/email-verify')
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/logout')
      if (data.success) {
        setIsLoggedin(false)
        setUserData(null)
        navigate('/')
        toast.success('Logged out successfully')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          
          <div className="flex-shrink-0">
            <NavLink to={'/home'} className="text-xl font-bold text-orange-400">
              Zerodha Clone
            </NavLink>
          </div>

          
          <div className="flex items-center space-x-6">
            
            
            <div className="hidden md:flex items-center space-x-1">
              
              <NavLink 
                to={'orders'} 
                className={({ isActive }) => 
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                Orders
              </NavLink>
              <NavLink 
                to={'holdings'} 
                className={({ isActive }) => 
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                Holdings
              </NavLink>
              <NavLink 
                to={'positions'} 
                className={({ isActive }) => 
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                Positions
              </NavLink>
              <NavLink 
                to={'funds'} 
                className={({ isActive }) => 
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                Funds
              </NavLink>
            </div>

            
            <div className="relative">
              {userData ? (
                <div className="group relative">
                  
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-black text-white font-bold text-lg cursor-pointer border-3 border-white shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600">
                    {userData.name[0].toUpperCase()}
                  </div>
                  
                  
                  <div className="absolute hidden group-hover:block right-0 top-full mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                    
                    
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-indigo-50/30 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-black text-white font-bold text-xl">
                            {userData.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 font-bold text-lg">{userData.name}</span>
                              {userData.isAccountVerified && (
                                <img src={verifiedlogo} alt="Verified" className="h-5 w-5" />
                              )}
                            </div>
                            <p className="text-gray-500 text-sm truncate mt-1">{userData.email}</p>
                          </div>
                        </div>
                        
                      </div>
                      
                    </div>
                    
                    
                    <div className="py-2 bg-white">
                      {!userData.isAccountVerified && (
                        <button
                          onClick={sendVerificationOtp}
                          className="w-full px-6 py-3.5 text-left text-gray-800 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 cursor-pointer transition-all duration-200 flex items-center gap-3 border-b border-gray-100 group/item"
                        >
                          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center group-hover/item:from-indigo-200 group-hover/item:to-purple-200 transition-all duration-200">
                            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold text-sm">Verify Email</div>
                            <div className="text-gray-500 text-xs mt-0.5">Click to verify your account</div>
                          </div>
                        </button>
                      )}
                      <button
                        onClick={logout}
                        className="w-full px-6 py-3.5 text-left text-gray-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 cursor-pointer transition-all duration-200 flex items-center gap-3 group/item"
                      >
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-red-100 to-orange-100 flex items-center justify-center group-hover/item:from-red-200 group-hover/item:to-orange-200 transition-all duration-200">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Logout</div>
                          <div className="text-gray-500 text-xs mt-0.5">Sign out from your account</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-2.5 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

     
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="flex justify-around py-2">
          <NavLink 
            to={'/home'} 
            className={({ isActive }) => 
              `flex-1 text-center py-2 text-xs font-medium ${
                isActive 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink 
            to={'orders'} 
            className={({ isActive }) => 
              `flex-1 text-center py-2 text-xs font-medium ${
                isActive 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Orders
          </NavLink>
          <NavLink 
            to={'holdings'} 
            className={({ isActive }) => 
              `flex-1 text-center py-2 text-xs font-medium ${
                isActive 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Holdings
          </NavLink>
          <NavLink 
            to={'positions'} 
            className={({ isActive }) => 
              `flex-1 text-center py-2 text-xs font-medium ${
                isActive 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Positions
          </NavLink>
          <NavLink 
            to={'funds'} 
            className={({ isActive }) => 
              `flex-1 text-center py-2 text-xs font-medium ${
                isActive 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Funds
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar