import React, { useContext, useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faCreditCard, faChartLine, faWallet, faArrowTrendUp, faArrowTrendDown, faRefresh } from '@fortawesome/free-solid-svg-icons'
import { AppContent } from '../Context/AppContext'
import StockSearch from './StockSearch'
import axios from 'axios'

const Header = () => {
    const { userData } = useContext(AppContent)
    const [holdingsData, setHoldingsData] = useState({
        holdings: [],
        currentBalance: 0,
        totalInvestment: 0,
        totalCurrentValue: 0,
        totalPnL: 0,
        totalPnLPercentage: 0,
        holdingsCount: 0
    })
    const [currentPrices, setCurrentPrices] = useState({})
    const [loading, setLoading] = useState(true)
    const [pricesLoading, setPricesLoading] = useState(false)
    const [error, setError] = useState('')
    const [lastUpdated, setLastUpdated] = useState(null)

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003'
// ADD THIS DEBUG CODE:
console.log('=== BACKEND URL DEBUG ===')
console.log('Raw VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL)
console.log('All env vars:', import.meta.env)
console.log('Final backendUrl:', backendUrl)
console.log('========================')
    // Function to fetch current price for a single stock
    const fetchSingleStockPrice = async (symbol) => {
        try {
            const response = await axios.get(`${backendUrl}/api/stocks/quote`, {
                params: { symbol: symbol },
                withCredentials: true,
                timeout: 10000
            })
            
            if (response.data && response.data.c) {
                return response.data.c
            }
            return null
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error.message)
            return null
        }
    }

    // Function to fetch current prices for all holdings
    const fetchCurrentPrices = useCallback(async (holdings) => {
        if (!holdings || holdings.length === 0) return
        
        setPricesLoading(true)
        try {
            console.log(`Fetching real-time prices for ${holdings.length} stocks...`)
            
            // Fetch prices for all stocks in parallel
            const pricePromises = holdings.map(holding => 
                fetchSingleStockPrice(holding.stockName)
            )
            
            const prices = await Promise.all(pricePromises)
            
            // Create prices object
            const newPrices = {}
            let successCount = 0
            
            holdings.forEach((holding, index) => {
                if (prices[index] !== null && prices[index] > 0) {
                    newPrices[holding.stockName] = prices[index]
                    successCount++
                } else {
                    // Fallback to average price if fetch fails
                    newPrices[holding.stockName] = holding.avgPrice
                }
            })
            
            setCurrentPrices(newPrices)
            setLastUpdated(new Date())
            console.log(` Updated prices: ${successCount}/${holdings.length} stocks`)
            
            // Update portfolio calculations with new prices
            updatePortfolioCalculations(holdings, newPrices)
            
        } catch (error) {
            console.error('Error fetching current prices:', error)
        } finally {
            setPricesLoading(false)
        }
    }, [backendUrl])

    // Function to update portfolio calculations with current prices
    const updatePortfolioCalculations = (holdings, prices) => {
        let totalCurrentValue = 0
        let totalInvestment = 0
        
        holdings.forEach(holding => {
            const currentPrice = prices[holding.stockName] || holding.avgPrice
            totalCurrentValue += currentPrice * holding.quantity
            totalInvestment += holding.totalCost
        })
        
        const totalPnL = totalCurrentValue - totalInvestment
        const totalPnLPercentage = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0
        
        setHoldingsData(prev => ({
            ...prev,
            totalCurrentValue,
            totalPnL,
            totalPnLPercentage
        }))
    }

    // Function to fetch holdings data
    const fetchHoldingsData = async () => {
        setLoading(true)
        setError('')
        
        try {
            console.log('Fetching holdings data...')
            const response = await axios.get(`${backendUrl}/api/orders/holdings`, {
                withCredentials: true,
                timeout: 10000
            })
            
            if (response.data.success) {
                const holdings = response.data.data.holdings
                const currentBalance = response.data.data.currentBalance
                
                let totalInvestment = 0
                holdings.forEach(holding => {
                    totalInvestment += holding.totalCost
                })
                
                const holdingsCount = holdings.length
                
                setHoldingsData({
                    holdings,
                    currentBalance,
                    totalInvestment,
                    totalCurrentValue: totalInvestment, // Will be updated with real prices
                    totalPnL: 0,
                    totalPnLPercentage: 0,
                    holdingsCount
                })
                
                // Fetch current prices if there are holdings
                if (holdings.length > 0) {
                    await fetchCurrentPrices(holdings)
                }
            } else {
                throw new Error(response.data.message || 'Failed to fetch holdings')
            }
        } catch (error) {
            console.error('Error fetching holdings data:', error)
            setError(error.response?.data?.message || error.message || 'Failed to fetch holdings data')
        } finally {
            setLoading(false)
        }
    }

    // Manual refresh function
    const handleManualRefresh = async () => {
        console.log('🔄 Manual refresh triggered')
        if (holdingsData.holdings.length > 0) {
            await fetchCurrentPrices(holdingsData.holdings)
        } else {
            await fetchHoldingsData()
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchHoldingsData()
    }, [])

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (holdingsData.holdings.length > 0 && !pricesLoading) {
            const intervalId = setInterval(() => {
                console.log('🔄 Auto-refreshing prices...')
                fetchCurrentPrices(holdingsData.holdings)
            }, 30000) // Update every 30 seconds
            
            return () => clearInterval(intervalId)
        }
    }, [holdingsData.holdings, fetchCurrentPrices, pricesLoading])

    // Format number with K, M, B
    const formatNumber = (num) => {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B'
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M'
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K'
        }
        return num.toFixed(2)
    }

    const marginAvailable = holdingsData.currentBalance
    const marginUsed = holdingsData.totalInvestment
    const openingBalance = holdingsData.currentBalance + holdingsData.totalInvestment

    // Stats Card Component
    const StatsCard = ({ icon, label, value, suffix = '', prefix = '', trend = null, isLoading = false }) => (
        <div className="bg-gradient-to-br from-gray-800/40 to-indigo-900/20 rounded-xl p-4 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <FontAwesomeIcon className="text-indigo-400 text-sm" icon={icon} />
                </div>
                {trend !== null && !isLoading && (
                    <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend >= 0 ? (
                            <FontAwesomeIcon icon={faArrowTrendUp} className="h-3 w-3" />
                        ) : (
                            <FontAwesomeIcon icon={faArrowTrendDown} className="h-3 w-3" />
                        )}
                        <span>{Math.abs(trend).toFixed(2)}%</span>
                    </div>
                )}
                {isLoading && (
                    <div className="h-4 w-12 bg-gray-700/50 rounded animate-pulse"></div>
                )}
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            {isLoading ? (
                <div className="h-7 w-24 bg-gray-700/50 rounded animate-pulse"></div>
            ) : (
                <p className="text-xl font-bold text-white">
                    {prefix}{formatNumber(value)}{suffix}
                </p>
            )}
        </div>
    )

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f1f] to-[#0a0a1a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                {/* Welcome Section */}
                <div className="mb-8 lg:mb-10">
                    <div className="bg-gradient-to-br from-gray-800/40 to-indigo-900/20 rounded-2xl p-5 sm:p-6 lg:p-8 border border-white/10 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Welcome back, {userData ? userData.name.split(' ')[0] : 'Investor'}!
                            </h1>
                            
                            {/* Refresh Button */}
                            <button
                                onClick={handleManualRefresh}
                                disabled={pricesLoading || loading}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                                    pricesLoading || loading
                                        ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                        : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
                                } text-white shadow-lg`}
                            >
                                {pricesLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faRefresh} className="h-4 w-4" />
                                        Refresh Prices
                                    </>
                                )}
                            </button>
                        </div>
                        
                        {/* Last Updated Timestamp */}
                        {lastUpdated && !pricesLoading && !loading && (
                            <p className="text-xs text-gray-500 mt-2">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </p>
                        )}
                        {pricesLoading && (
                            <p className="text-xs text-yellow-500 mt-2 animate-pulse">
                                Fetching latest market prices...
                            </p>
                        )}
                    </div>
                </div>

                {loading ? (
                    // Loading Skeleton
                    <div className="animate-pulse">
                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-28 bg-gray-800/50 rounded-xl"></div>
                                    <div className="h-28 bg-gray-800/50 rounded-xl"></div>
                                    <div className="h-28 bg-gray-800/50 rounded-xl"></div>
                                    <div className="h-28 bg-gray-800/50 rounded-xl"></div>
                                </div>
                                <div className="h-48 bg-gray-800/50 rounded-xl"></div>
                            </div>
                            <div className="h-[600px] bg-gray-800/50 rounded-xl"></div>
                        </div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                        {/* Left Column - Portfolio Stats */}
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <StatsCard 
                                    icon={faClock} 
                                    label="Margin Available" 
                                    value={marginAvailable} 
                                    prefix="₹ "
                                    isLoading={loading}
                                />
                                <StatsCard 
                                    icon={faWallet} 
                                    label="Opening Balance" 
                                    value={openingBalance} 
                                    prefix="₹ "
                                    isLoading={loading}
                                />
                                <StatsCard 
                                    icon={faCreditCard} 
                                    label="Total Investment" 
                                    value={holdingsData.totalInvestment} 
                                    prefix="₹ "
                                    isLoading={loading}
                                />
                                <StatsCard 
                                    icon={faChartLine} 
                                    label="Total Returns" 
                                    value={Math.abs(holdingsData.totalPnLPercentage)} 
                                    suffix="%" 
                                    prefix={holdingsData.totalPnLPercentage >= 0 ? '+' : '-'}
                                    trend={holdingsData.totalPnLPercentage}
                                    isLoading={loading || pricesLoading}
                                />
                            </div>

                            {/* Holdings Summary Card */}
                            <div className="bg-gradient-to-br from-gray-800/40 to-indigo-900/20 rounded-xl border border-white/10 backdrop-blur-sm overflow-hidden">
                                <div className="p-5 border-b border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                                                <FontAwesomeIcon className="text-green-400 text-lg" icon={faCreditCard} />
                                            </div>
                                            <div>
                                                <h2 className="text-lg sm:text-xl font-semibold text-white">Holdings</h2>
                                                <p className="text-xs text-gray-400">Your investment portfolio</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {pricesLoading && (
                                                <span className="text-xs text-yellow-400 animate-pulse">Updating...</span>
                                            )}
                                            <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                                                {holdingsData.holdingsCount} {holdingsData.holdingsCount === 1 ? 'Stock' : 'Stocks'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-5">
                                    {holdingsData.holdingsCount === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="h-16 w-16 mx-auto mb-4 bg-gray-700/30 rounded-full flex items-center justify-center">
                                                <FontAwesomeIcon className="text-gray-500 text-2xl" icon={faWallet} />
                                            </div>
                                            <p className="text-gray-400">No holdings yet</p>
                                            <p className="text-xs text-gray-500 mt-2">Start investing to see your portfolio here</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Summary Stats */}
                                            <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-white/10">
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Current Value</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-2xl font-bold text-white">
                                                            ₹ {formatNumber(holdingsData.totalCurrentValue)}
                                                        </p>
                                                        {pricesLoading && (
                                                            <div className="animate-pulse h-4 w-4 bg-yellow-500/50 rounded-full"></div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 mb-1">Total P&L</p>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <p className={`text-xl font-bold ${holdingsData.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {holdingsData.totalPnL >= 0 ? '+' : ''}₹ {formatNumber(Math.abs(holdingsData.totalPnL))}
                                                        </p>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${holdingsData.totalPnLPercentage >= 0 ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'}`}>
                                                            {holdingsData.totalPnLPercentage >= 0 ? '+' : ''}{holdingsData.totalPnLPercentage.toFixed(2)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Recent Holdings Preview */}
                                            <div className="space-y-3">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Holdings</p>
                                                {holdingsData.holdings.slice(0, 3).map((holding, index) => {
                                                    const currentPrice = currentPrices[holding.stockName] || holding.avgPrice
                                                    const pnl = (currentPrice - holding.avgPrice) * holding.quantity
                                                    const pnlPercent = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100
                                                    
                                                    return (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all">
                                                            <div>
                                                                <p className="text-white font-medium text-sm">{holding.stockName}</p>
                                                                <p className="text-xs text-gray-400">Qty: {holding.quantity}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-white text-sm">₹ {currentPrice.toFixed(2)}</p>
                                                                <p className={`text-xs font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                
                                                {holdingsData.holdingsCount > 3 && (
                                                    <button 
                                                        onClick={() => window.location.href = '/home/holdings'}
                                                        className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 py-2"
                                                    >
                                                        View all {holdingsData.holdingsCount} holdings →
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => window.location.href = '/home/funds'}
                                    className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-3 text-center hover:scale-105 transition-all duration-300 group"
                                >
                                    <p className="text-indigo-400 text-sm font-semibold group-hover:text-indigo-300">Add Funds</p>
                                    <p className="text-gray-500 text-xs mt-1">Deposit money</p>
                                </button>
                                <button 
                                    onClick={() => window.location.href = '/home/holdings'}
                                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-3 text-center hover:scale-105 transition-all duration-300 group"
                                >
                                    <p className="text-green-400 text-sm font-semibold group-hover:text-green-300">View Portfolio</p>
                                    <p className="text-gray-500 text-xs mt-1">See all holdings</p>
                                </button>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-red-400 text-sm">{error}</p>
                                            <button 
                                                onClick={fetchHoldingsData}
                                                className="text-xs text-red-400 underline mt-1"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Stock Search */}
                        <div className="lg:sticky lg:top-24">
                            <div className="bg-gradient-to-br from-gray-800/30 to-indigo-900/20 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden h-full">
                                <div className="p-4 sm:p-5">
                                    <StockSearch />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Header