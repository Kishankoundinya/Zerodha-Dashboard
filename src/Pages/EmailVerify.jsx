import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { AppContent } from '../Context/AppContext'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import logo from '../assets/Images/logo.svg'

const EmailVerify = () => {
    axios.defaults.withCredentials = true;
    const navigate = useNavigate();
    const { userData, backendUrl, getUserData, isLoggedin } = useContext(AppContent)
    const inputRefs = React.useRef([])
    const [isLoading, setIsLoading] = useState(false)
     const frontendUrl = import.meta.env.VITE_FRONTEND_URL 

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

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            setIsLoading(true)
            const otpArray = inputRefs.current.map(e => e.value)
            const otp = otpArray.join('')
            const { data } = await axios.post(backendUrl + '/api/auth/verify-account', { otp })
            if (data.success) {
                toast.success(data.message)
                getUserData()
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isLoggedin && userData && userData.isAccountVerified) {
            navigate('/')
        }
    }, [isLoggedin, userData, navigate])

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [])

    return (
        <div className='min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4'>
            <div className='absolute top-8 left-8'>
            <NavLink to={frontendUrl} className="text-xl font-bold text-orange-400">
              Zerodha Clone
            </NavLink>
            </div>

            <div className='w-full max-w-md'>
                <div className='mb-8 text-center'>
                    <h1 className='text-3xl font-bold text-white mb-3'>Verify Your Email</h1>
                    <p className='text-gray-400'>
                        Enter the 6-digit code sent to your email address
                    </p>
                </div>

                <div className='bg-gray-900 p-8 rounded-2xl border border-gray-800'>
                    <form onSubmit={onSubmitHandler} className='space-y-8'>
                        <div className='space-y-4'>
                            <p className='text-gray-300 text-center text-sm'>
                                Check your inbox for the verification code
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
                            disabled={isLoading}
                            className={`w-full py-3.5 rounded-xl font-medium text-white transition-all ${isLoading
                                ? 'bg-gray-700 cursor-not-allowed'
                                : 'bg-indigo-700 hover:bg-indigo-600'
                                }`}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>

                    <div className='mt-6 pt-6 border-t border-gray-800 text-center'>
                        <p className='text-gray-400 text-sm'>
                            Didn't receive the code?{' '}
                            <button
                                type='button'
                                className='text-indigo-400 hover:text-indigo-300 font-medium transition-colors'
                            >
                                Resend Code
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmailVerify