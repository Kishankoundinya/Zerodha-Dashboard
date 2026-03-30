import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContent } from '../Context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import verifiedlogo from '../assets/Images/verified.svg'
import logo from '../assets/Images/LogoImg.svg'

const Navbar = () => {
  const navigate = useNavigate()
  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContent)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp')
      if (data.success) {
        navigate('/email-verify')
        toast.success(data.message)
        setIsDropdownOpen(false)
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
        setIsDropdownOpen(false)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#00001b] to-[#00002b] border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to={'/home'} className="text-xl font-serif font-bold">
              <div className='flex items-end'>
                <img className="h-10 w-auto filter brightness-0 invert hover:scale-105 transition-transform duration-300" src={logo} alt="Logo" />
              </div>
            </NavLink>
          </div>

          {/* Right side content - Navlinks and User Menu */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <NavLink
                to={'orders'}
                className={({ isActive }) =>
                  `px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
                  }`
                }
              >
                Orders
              </NavLink>
              <NavLink
                to={'holdings'}
                className={({ isActive }) =>
                  `px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
                  }`
                }
              >
                Holdings
              </NavLink>
              <NavLink
                to={'positions'}
                className={({ isActive }) =>
                  `px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
                  }`
                }
              >
                Positions
              </NavLink>
              <NavLink
                to={'funds'}
                className={({ isActive }) =>
                  `px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
                  }`
                }
              >
                Funds
              </NavLink>
            </div>

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              {userData ? (
                <>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg cursor-pointer border-2 border-white/30 shadow-xl hover:scale-110 transition-all duration-300 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#00001b]"
                  >
                    {userData.name[0].toUpperCase()}
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-3 w-80 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeInUp">
                      {/* User Info Section */}
                      <div className="p-6 bg-gradient-to-br from-gray-800/50 to-indigo-900/30 border-b border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xl shadow-lg">
                              {userData.name[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold text-lg">{userData.name}</span>
                                {userData.isAccountVerified && (
                                  <img src={verifiedlogo} alt="Verified" className="h-5 w-5 animate-pulse" />
                                )}
                              </div>
                              <p className="text-gray-400 text-sm truncate mt-1 max-w-[180px]">{userData.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {!userData.isAccountVerified && (
                          <button
                            onClick={sendVerificationOtp}
                            className="w-full px-6 py-3.5 text-left text-gray-200 hover:bg-white/10 hover:text-white cursor-pointer transition-all duration-200 flex items-center gap-3 border-b border-white/10 group"
                          >
                            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all duration-200">
                              <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
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
                          className="w-full px-6 py-3.5 text-left text-gray-200 hover:bg-white/10 hover:text-white cursor-pointer transition-all duration-200 flex items-center gap-3 group"
                        >
                          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center group-hover:from-red-500/30 group-hover:to-orange-500/30 transition-all duration-200">
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  )}
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 lg:px-8 py-2.5 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm lg:text-base"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden bg-gradient-to-b from-[#00001b] to-[#00002b] border-t border-white/10 shadow-xl animate-slideDown">
          <div className="flex flex-col py-4 px-4 space-y-2">
            <NavLink
              to={'orders'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              Orders
            </NavLink>
            <NavLink
              to={'holdings'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              Holdings
            </NavLink>
            <NavLink
              to={'positions'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              Positions
            </NavLink>
            <NavLink
              to={'funds'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              Funds
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar