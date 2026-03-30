import React from 'react'
import { useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faCreditCard, faChartLine, faWallet } from '@fortawesome/free-solid-svg-icons'
import { AppContent } from '../Context/AppContext'
import StockPriceChart from './StockPriceChart'

const Header = () => {
    const { userData } = useContext(AppContent)

    // Sample data - you can replace with actual data from your backend
    const marginAvailable = 3740
    const marginUsed = 0
    const openingBalance = 3740
    const holdingsCount = 13
    const pnl = 1550
    const pnlPercentage = 5.20
    const currentValue = 31430
    const investment = 29880

    return (
        <div className='w-full min-h-screen lg:min-h-0'>
            {/* Main Grid Layout - Responsive */}
            <div className='flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8'>
                
                {/* Left Section - User Info & Stats */}
                <div className='w-full lg:w-1/2 space-y-6'>
                    {/* Welcome Header */}
                    <div className='bg-gradient-to-br from-gray-800/50 to-indigo-900/30 rounded-2xl p-6 border border-white/10 backdrop-blur-sm'>
                        <h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent'>
                            Hi, {userData ? userData.name : 'User'}!
                        </h1>
                        <p className='text-gray-400 mt-2 text-sm'>Welcome back to your dashboard</p>
                    </div>

                    {/* Equity Section */}
                    <div className='bg-gradient-to-br from-gray-800/50 to-indigo-900/30 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden hover:scale-[1.02] transition-all duration-300'>
                        <div className='p-5 border-b border-white/10'>
                            <div className='flex items-center gap-3'>
                                <div className='h-10 w-10 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 flex items-center justify-center'>
                                    <FontAwesomeIcon className='text-indigo-400 text-lg' icon={faClock} />
                                </div>
                                <h2 className='text-xl font-semibold text-white'>Equity</h2>
                            </div>
                        </div>
                        
                        <div className='p-5'>
                            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6'>
                                <div className='text-center sm:text-left'>
                                    <p className='text-4xl sm:text-5xl font-bold text-white mb-2'>
                                        ₹ {(marginAvailable / 1000).toFixed(2)}k
                                    </p>
                                    <p className='text-xs text-gray-400'>Margin Available</p>
                                </div>
                                
                                <div className='hidden sm:block w-px h-16 bg-gradient-to-b from-transparent via-gray-500 to-transparent'></div>
                                
                                <div className='flex-1 space-y-2'>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-sm text-gray-400'>Margin Used</span>
                                        <span className='text-sm font-semibold text-gray-200'>₹ {marginUsed}</span>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-sm text-gray-400'>Opening Balance</span>
                                        <span className='text-sm font-semibold text-gray-200'>₹ {(openingBalance / 1000).toFixed(2)}k</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Holdings Section */}
                    <div className='bg-gradient-to-br from-gray-800/50 to-indigo-900/30 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden hover:scale-[1.02] transition-all duration-300'>
                        <div className='p-5 border-b border-white/10'>
                            <div className='flex items-center gap-3'>
                                <div className='h-10 w-10 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center'>
                                    <FontAwesomeIcon className='text-green-400 text-lg' icon={faCreditCard} />
                                </div>
                                <h2 className='text-xl font-semibold text-white'>Holdings ({holdingsCount})</h2>
                            </div>
                        </div>
                        
                        <div className='p-5'>
                            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6'>
                                <div className='text-center sm:text-left'>
                                    <div className='flex items-baseline gap-2'>
                                        <p className='text-4xl sm:text-5xl font-bold text-green-400'>
                                            ₹ {(pnl / 1000).toFixed(2)}k
                                        </p>
                                        <p className='text-sm font-semibold text-green-400 bg-green-500/20 px-2 py-1 rounded-full'>
                                            +{pnlPercentage}%
                                        </p>
                                    </div>
                                    <p className='text-xs text-gray-400 mt-2'>Total P&L</p>
                                </div>
                                
                                <div className='hidden sm:block w-px h-16 bg-gradient-to-b from-transparent via-gray-500 to-transparent'></div>
                                
                                <div className='flex-1 space-y-2'>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-sm text-gray-400'>Current Value</span>
                                        <span className='text-sm font-semibold text-gray-200'>₹ {(currentValue / 1000).toFixed(2)}k</span>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-sm text-gray-400'>Investment</span>
                                        <span className='text-sm font-semibold text-gray-200'>₹ {(investment / 1000).toFixed(2)}k</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats - Additional Info */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='bg-gradient-to-br from-gray-800/30 to-indigo-900/30 rounded-xl p-4 border border-white/10 hover:scale-105 transition-all duration-300'>
                            <div className='flex items-center gap-2 mb-2'>
                                <FontAwesomeIcon className='text-indigo-400 text-sm' icon={faWallet} />
                                <p className='text-xs text-gray-400'>Total Value</p>
                            </div>
                            <p className='text-xl font-bold text-white'>₹ {(currentValue / 1000).toFixed(2)}k</p>
                        </div>
                        
                        <div className='bg-gradient-to-br from-gray-800/30 to-indigo-900/30 rounded-xl p-4 border border-white/10 hover:scale-105 transition-all duration-300'>
                            <div className='flex items-center gap-2 mb-2'>
                                <FontAwesomeIcon className='text-green-400 text-sm' icon={faChartLine} />
                                <p className='text-xs text-gray-400'>Returns</p>
                            </div>
                            <p className='text-xl font-bold text-green-400'>+{pnlPercentage}%</p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Chart */}
                <div className='w-full lg:w-1/2'>
                    <div className='bg-gradient-to-br from-gray-800/50 to-indigo-900/30 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden h-full min-h-[400px] lg:min-h-[600px]'>
                        <div className='p-5 border-b border-white/10'>
                            <div className='flex items-center justify-between'>
                                <h2 className='text-xl font-semibold text-white'>Market Overview</h2>
                                <div className='flex gap-2'>
                                    <button className='px-3 py-1 text-xs rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all duration-200'>
                                        1D
                                    </button>
                                    <button className='px-3 py-1 text-xs rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all duration-200'>
                                        1W
                                    </button>
                                    <button className='px-3 py-1 text-xs rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'>
                                        1M
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='p-4 h-[calc(100%-80px)]'>
                            <StockPriceChart />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header