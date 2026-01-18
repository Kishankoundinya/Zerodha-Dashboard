import React, { useState, useContext, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import mail_icon from '../assets/Images/Email.svg'
import Lock_icon from '../assets/Images/lock.svg'
import { AppContent } from '../Context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'


const ResetPassword = () => {
    const { backendUrl } = useContext(AppContent)
    axios.defaults.withCredentials = true;
    const navigate = useNavigate();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isEmailSent, setIsEmailSent] = useState(false)
    const [otp, setOtp] = useState('')
    const [isOtpSubmitted, setIsOtpSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
     const frontendUrl = import.meta.env.VITE_FRONTEND_URL 

    const inputRefs = React.useRef([])

    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    }

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text')
        const pasteArray = paste.split('');
        pasteArray.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char;
            }
        })
    }

    const onSubmitEmail = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/send-reset-otp', { email })
            data.success ? toast.success(data.message) : toast.error(data.message)
            data.success && setIsEmailSent(true)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmitOTP = (e) => {
        e.preventDefault();
        const otpValue = inputRefs.current
            .map(input => input.value)
            .join('');

        if (otpValue.length !== 6) {
            toast.error('Please enter full 6-digit OTP');
            return;
        }

        setOtp(otpValue);
        setIsOtpSubmitted(true);
    }

    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/reset-password', { email, otp, newPassword: password })
            data.success ? toast.success(data.message) : toast.error(data.message)
            data.success && navigate('/login')
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isEmailSent && !isOtpSubmitted && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [isEmailSent, isOtpSubmitted])

    return (
        <div className='min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4'>
            <div className='absolute top-8 left-8'>
                <NavLink to={frontendUrl} className="text-xl font-bold text-orange-400">
              Zerodha Clone
            </NavLink>
            </div>

            <div className='w-full max-w-md'>
                <div className='mb-8 text-center'>
                    <h1 className='text-3xl font-bold text-white mb-3'>Reset Password</h1>
                    <p className='text-gray-400'>
                        {!isEmailSent ? 'Enter your registered email to get started' :
                            !isOtpSubmitted ? 'Enter the OTP sent to your email' :
                                'Create a new password for your account'}
                    </p>
                </div>

                <div className='bg-gray-900 p-8 rounded-2xl border border-gray-800'>
                    {/* Email Form */}
                    {!isEmailSent && (
                        <form onSubmit={onSubmitEmail} className='space-y-6'>
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
                            <button
                                type='submit'
                                disabled={isLoading}
                                className='w-full py-3.5 rounded-xl font-medium text-white bg-indigo-700 hover:bg-indigo-600 transition-colors'
                            >
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {/* OTP Form */}
                    {!isOtpSubmitted && isEmailSent && (
                        <form onSubmit={onSubmitOTP} className='space-y-8'>
                            <div className='space-y-4'>
                                <p className='text-gray-300 text-center text-sm'>
                                    Check your email for the 6-digit verification code
                                </p>
                                <div className='flex justify-between gap-3' onPaste={handlePaste}>
                                    {Array(6).fill(0).map((_, index) => (
                                        <input
                                            type="text"
                                            maxLength='1'
                                            key={index}
                                            required
                                            className='w-14 h-14 bg-gray-800 border border-gray-700 text-white text-center text-2xl font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                                            ref={el => inputRefs.current[index] = el}
                                            onInput={(e) => handleInput(e, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button
                                type='submit'
                                className='w-full py-3.5 rounded-xl font-medium text-white bg-indigo-700 hover:bg-indigo-600 transition-colors'
                            >
                                Verify OTP
                            </button>
                        </form>
                    )}

                    {/* New Password Form */}
                    {isOtpSubmitted && isEmailSent && (
                        <form onSubmit={onSubmitNewPassword} className='space-y-6'>
                            <div className='flex items-center bg-gray-800 rounded-xl px-4 py-3'>
                                <img className='h-5 w-5 mr-3' src={Lock_icon} alt="Password" />
                                <input
                                    onChange={e => setPassword(e.target.value)}
                                    value={password}
                                    className='w-full bg-transparent text-white placeholder-gray-500 focus:outline-none'
                                    type="password"
                                    placeholder='New Password'
                                    required
                                />
                            </div>
                            <button
                                type='submit'
                                disabled={isLoading}
                                className='w-full py-3.5 rounded-xl font-medium text-white bg-indigo-700 hover:bg-indigo-600 transition-colors'
                            >
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ResetPassword