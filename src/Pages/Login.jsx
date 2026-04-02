import React, { useContext, useState } from 'react'
import person_icon from '../assets/Images/person-icon.svg'
import mail_icon from '../assets/Images/Email.svg'
import lock_icon from '../assets/Images/lock.svg'
import logo from '../assets/Images/LogoImg.svg'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContent } from '../Context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify';

const Login = () => {
    const navigate = useNavigate()
    const { setIsLoggedin, getUserData, setUserData } = useContext(AppContent) // Changed: removed 'login'
    const [state, setState] = useState("Sign Up")
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL 

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        try {
            if (state === 'Sign Up') {
                const { data } = await axios.post('/api/auth/register', 
                    { name, email, password }
                )
                if (data.success) {
                    // Store user data
                    if (data.userData) {
                        localStorage.setItem('userData', JSON.stringify(data.userData));
                        setUserData(data.userData);
                    }
                    
                    setIsLoggedin(true);
                    localStorage.setItem('isLoggedin', 'true');
                    
                    toast.success('Account created successfully!');
                    
                    setTimeout(() => {
                        navigate('/home')
                    }, 500);
                } else {
                    toast.error(data.message)
                }
            } else {
                // LOGIN - THIS IS WHERE THE CHANGE IS NEEDED
                console.log('Logging in with:', email);
                
                const { data } = await axios.post('/api/auth/login', 
                    { email, password },
                    { 
                        withCredentials: true  // IMPORTANT: This ensures cookies are sent/received
                    }
                )
                
                console.log('Login response:', data);
                
                if (data.success) {
                    // Store token if backend returns one
                    if (data.token) {
                        localStorage.setItem('authToken', data.token);
                        // Set default auth header for all future axios requests
                        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                    }
                    
                    // Store user data
                    if (data.userData) {
                        localStorage.setItem('userData', JSON.stringify(data.userData));
                        setUserData(data.userData);
                    }
                    
                    setIsLoggedin(true);
                    localStorage.setItem('isLoggedin', 'true');
                    
                    // Also try to fetch fresh user data
                    await getUserData();
                    
                    toast.success('Login successful!');
                    navigate('/home');
                } else {
                    toast.error(data.message || 'Login failed');
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            if (error.response) {
                toast.error(error.response.data?.message || 'Server error occurred');
            } else if (error.request) {
                toast.error('Cannot connect to server. Please check if backend is running.');
            } else {
                toast.error(error.message || 'An error occurred');
            }
        }
    }

    return (
        <div className='min-h-screen bg-[#00001b] flex items-center justify-center px-4'>
            <div className='absolute top-8 left-8'>
                <NavLink to={frontendUrl} className="text-xl font-bold text-orange-400">
                    <img src={logo} alt="Logo" />
                </NavLink>
            </div>

            <div className='w-full max-w-md'>
                <div className='mb-10 text-center'>
                    <h1 className='text-4xl font-bold text-white mb-2'>
                        {state === 'Sign Up' ? 'Join Us' : 'Welcome Back'}
                    </h1>
                    <p className='text-gray-400'>
                        {state === 'Sign Up' ? 'Create your account to get started' : 'Sign in to access your account'}
                    </p>
                </div>

                <div className='bg-gray-900 p-8 rounded-2xl border border-gray-800'>
                    <form onSubmit={onSubmitHandler} className='space-y-6'>
                        {state === 'Sign Up' && (
                            <div className='flex items-center bg-gray-800 rounded-xl px-4 py-3'>
                                <img className='h-5 w-5 mr-3' src={person_icon} alt="Person" />
                                <input
                                    onChange={e => setName(e.target.value)}
                                    value={name}
                                    className='w-full bg-transparent text-white placeholder-gray-500 focus:outline-none'
                                    type="text"
                                    placeholder='Full Name'
                                    required
                                />
                            </div>
                        )}

                        <div className='flex items-center bg-gray-800 rounded-xl px-4 py-3'>
                            <img className='h-5 w-5 mr-3' src={mail_icon} alt="Email" />
                            <input
                                onChange={e => setEmail(e.target.value)}
                                value={email}
                                className='w-full bg-transparent text-white placeholder-gray-500 focus:outline-none'
                                type="email"
                                placeholder='Email Address'
                                required
                            />
                        </div>

                        <div className='flex items-center bg-gray-800 rounded-xl px-4 py-3'>
                            <img className='h-5 w-5 mr-3' src={lock_icon} alt="Password" />
                            <input
                                onChange={e => setPassword(e.target.value)}
                                value={password}
                                className='w-full bg-transparent text-white placeholder-gray-500 focus:outline-none'
                                type="password"
                                placeholder='Password'
                                required
                            />
                        </div>

                        <p onClick={() => navigate('/reset-password')} className='text-right text-indigo-400 cursor-pointer text-sm'>
                            Forgot Password?
                        </p>

                        <button type="submit" className='w-full py-3.5 rounded-xl font-medium text-white bg-indigo-700 hover:bg-indigo-600 transition-colors'>
                            {state}
                        </button>
                    </form>

                    <div className='mt-8 pt-6 border-t border-gray-800 text-center'>
                        <p className='text-gray-400 text-sm'>
                            {state === 'Sign Up' ? 'Already have an account?' : "Don't have an account?"}
                            {' '}
                            <span 
                                onClick={() => setState(state === 'Sign Up' ? 'Login' : 'Sign Up')}
                                className='text-indigo-400 cursor-pointer font-medium hover:text-indigo-300'
                            >
                                {state === 'Sign Up' ? 'Sign In' : 'Create Account'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login