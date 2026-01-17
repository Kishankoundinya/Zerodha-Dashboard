import React, { useContext, useState } from 'react'
import person_icon from '../assets/Images/person-icon.svg'
import mail_icon from '../assets/Images/Email.svg'
import lock_icon from '../assets/Images/lock.svg'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContent } from '../Context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify';


const Login = () => {
    const navigate = useNavigate()
    const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent)
    const [state, setState] = useState("Sign Up")
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL 

    const onSubmitHandler = async (e) => {
        try {
            axios.defaults.withCredentials = true;
            e.preventDefault();
            if (state === 'Sign Up') {
                const { data } = await axios.post(backendUrl + '/api/auth/register', { name, email, password })
                if (data.success) {
                    setIsLoggedin(true);
                    getUserData();
                    setTimeout(() => {
                        navigate('/home')
                    }, 300);
                }
                else {
                    toast.error(data.message)
                }
            } else {
                const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password })
                if (data.success) {
                    setIsLoggedin(true)
                    getUserData();
                    navigate('/home')
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='min-h-screen bg-gray-950 flex items-center justify-center px-4'>
            <div className='absolute top-8 left-8'>
            <NavLink to={frontendUrl} className="text-xl font-bold text-orange-400">
              Zerodha Clone
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

                        <button className='w-full py-3.5 rounded-xl font-medium text-white bg-indigo-700'>
                            {state}
                        </button>
                    </form>

                    <div className='mt-8 pt-6 border-t border-gray-800 text-center'>
                        <p className='text-gray-400 text-sm'>
                            {state === 'Sign Up' ? 'Already have an account?' : "Don't have an account?"}
                            {' '}
                            <span 
                                onClick={() => setState(state === 'Sign Up' ? 'Login' : 'Sign Up')}
                                className='text-indigo-400 cursor-pointer font-medium'
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