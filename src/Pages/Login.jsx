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
    const { setIsLoggedin, getUserData, setUserData, backendUrl, login } = useContext(AppContent) // Added login and backendUrl
    const [state, setState] = useState("Sign Up")
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    // Configure axios for each request (or use the one from context)
    const api = axios.create({
        baseURL: backendUrl,
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
    });

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (state === 'Sign Up') {
                console.log('Registering with:', { name, email, password });
                
                const { data } = await api.post('/api/auth/register', { 
                    name, email, password 
                })
                
                console.log('Registration response:', data);
                
                if (data.success) {
                    // Use the login function from context
                    login(data.userData);
                    
                    toast.success('Account created successfully!');
                    
                    // Small delay before navigation
                    setTimeout(() => {
                        navigate('/home');
                    }, 500);
                } else {
                    toast.error(data.message || 'Registration failed');
                }
            } else {
                // LOGIN
                console.log('Logging in with:', { email, password });
                
                const { data } = await api.post('/api/auth/login', { 
                    email, password 
                })
                
                console.log('Login response:', data);
                
                if (data.success) {
                    // Use the login function from context
                    login(data.userData);
                    
                    toast.success('Login successful!');
                    navigate('/home');
                } else {
                    toast.error(data.message || 'Login failed');
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            
            if (error.response) {
                console.log('Server response:', error.response.data);
                toast.error(error.response.data?.message || 'Server error occurred');
            } else if (error.request) {
                console.log('No response. Backend URL:', backendUrl);
                toast.error(`Cannot connect to server at ${backendUrl}. Please check if backend is running.`);
            } else {
                toast.error(error.message || 'An error occurred');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='min-h-screen bg-[#00001b] flex items-center justify-center px-4'>
            <div className='absolute top-8 left-8'>
                <NavLink to="/" className="text-xl font-bold text-orange-400">
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

                        <button 
                            type="submit" 
                            disabled={loading}
                            className='w-full py-3.5 rounded-xl font-medium text-white bg-indigo-700 hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {loading ? 'Please wait...' : state}
                        </button>
                    </form>

                    <div className='mt-8 pt-6 border-t border-gray-800 text-center'>
                        <p className='text-gray-400 text-sm'>
                            {state === 'Sign Up' ? 'Already have an account?' : "Don't have an account?"}
                            {' '}
                            <span 
                                onClick={() => {
                                    setState(state === 'Sign Up' ? 'Login' : 'Sign Up');
                                    // Clear form when switching modes
                                    setName('');
                                    setEmail('');
                                    setPassword('');
                                }}
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