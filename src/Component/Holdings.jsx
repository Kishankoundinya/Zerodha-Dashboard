import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SellModal from './SellModal';

const Holdings = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrices, setCurrentPrices] = useState({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSingleStockPrice = async (symbol) => {
    try {
      console.log(`Fetching price for ${symbol}...`);
      const response = await axios.get('/api/stocks/quote', {
        params: { symbol: symbol },
        withCredentials: true,
        timeout: 10000
      });
      
      console.log(`Price for ${symbol}:`, response.data);
      
      if (response.data && response.data.c) {
        return response.data.c;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error.message);
      return null;
    }
  };

  const fetchCurrentPrices = useCallback(async (holdingsData, showLoading = true) => {
    if (!holdingsData || holdingsData.length === 0) {
      console.log('No holdings data to fetch prices for');
      return;
    }
    
    if (showLoading) {
      setPricesLoading(true);
    }
    
    try {
      console.log(`Fetching current prices for ${holdingsData.length} stocks...`);
      console.log('Stock symbols:', holdingsData.map(h => h.stockName));
      
      const pricePromises = holdingsData.map(holding => 
        fetchSingleStockPrice(holding.stockName)
      );
      
      const prices = await Promise.all(pricePromises);
      
      const newPrices = {};
      let successCount = 0;
      
      holdingsData.forEach((holding, index) => {
        if (prices[index] !== null && prices[index] > 0) {
          newPrices[holding.stockName] = prices[index];
          successCount++;
          console.log(`${holding.stockName}: Current price = ${prices[index]}`);
        } else {
          newPrices[holding.stockName] = holding.avgPrice;
          console.log(`${holding.stockName}: Using average price ${holding.avgPrice}`);
        }
      });
      
      setCurrentPrices(newPrices);
      setLastUpdated(new Date());
      console.log(`✅ Successfully fetched ${successCount}/${holdingsData.length} stock prices`);
      
    } catch (error) {
      console.error('Error fetching current prices:', error);
      const fallbackPrices = {};
      holdingsData.forEach(holding => {
        fallbackPrices[holding.stockName] = holding.avgPrice;
      });
      setCurrentPrices(fallbackPrices);
    } finally {
      if (showLoading) {
        setPricesLoading(false);
      }
    }
  }, []);

  const fetchHoldings = async () => {
    console.log('Fetching holdings...');
    setLoading(true);
    setError('');
    
    try {
      console.log('Making GET request to: /api/orders/holdings');
      
      const response = await axios.get('/api/orders/holdings', {
        withCredentials: true,
        timeout: 10000
      });
      
      console.log('Holdings response:', response.data);
      
      if (response.data.success) {
        const holdingsData = response.data.data.holdings;
        console.log(`Found ${holdingsData.length} holdings:`, holdingsData);
        
        setHoldings(holdingsData);
        
        if (holdingsData.length > 0) {
          await fetchCurrentPrices(holdingsData, true);
        } else {
          console.log('No holdings found');
          setPricesLoading(false);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch holdings');
      }
    } catch (error) {
      console.error('Error fetching holdings:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setError(error.response?.data?.message || error.message || 'Failed to fetch holdings');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    if (holdings.length > 0) {
      await fetchCurrentPrices(holdings, true);
    } else {
      await fetchHoldings();
    }
  };

  useEffect(() => {
    console.log('Holdings component mounted');
    fetchHoldings();
  }, []);

  useEffect(() => {
    if (holdings.length > 0 && !pricesLoading) {
      const intervalId = setInterval(() => {
        console.log('🔄 Auto-refreshing prices...');
        fetchCurrentPrices(holdings, false);
      }, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [holdings, fetchCurrentPrices]);

  const handleSellClick = (stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  const handleSellSuccess = () => {
    fetchHoldings();
    setIsModalOpen(false);
  };

  const calculatePnL = (holding) => {
    const currentPrice = currentPrices[holding.stockName] || holding.avgPrice;
    const currentValue = currentPrice * holding.quantity;
    const investment = holding.totalCost;
    const pnl = currentValue - investment;
    const pnlPercentage = investment > 0 ? (pnl / investment) * 100 : 0;
    return { pnl, pnlPercentage, currentValue, currentPrice };
  };

  const totalCurrentValue = holdings.reduce((total, holding) => {
    const currentPrice = currentPrices[holding.stockName] || holding.avgPrice;
    return total + (currentPrice * holding.quantity);
  }, 0);

  const totalInvestment = holdings.reduce((total, holding) => {
    return total + holding.totalCost;
  }, 0);
  
  const totalProfitLoss = totalCurrentValue - totalInvestment;
  const totalProfitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

  console.log('Holdings state:', { 
    loading, 
    holdingsCount: holdings.length, 
    error, 
    pricesCount: Object.keys(currentPrices).length 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading holdings...</div>
          <div className="text-gray-400 text-sm">Fetching your portfolio data</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={fetchHoldings}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400 text-xl mb-4">No holdings found</div>
          <p className="text-gray-500">Start trading to see your portfolio here</p>
          <button
            onClick={fetchHoldings}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full px-4 sm:px-6 lg:px-8 py-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-white/10'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent'>
            Holdings
          </h1>
          <p className='text-sm text-gray-400 mt-1'>
            {holdings.length} {holdings.length === 1 ? 'Instrument' : 'Instruments'}
            {pricesLoading && (
              <span className="ml-2 text-xs text-yellow-400 animate-pulse">
                🔄 Updating prices...
              </span>
            )}
            {lastUpdated && !pricesLoading && (
              <span className="ml-2 text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className='flex gap-3 mt-4 sm:mt-0'>
          <div className='text-right'>
            <p className='text-xs text-gray-400'>Total Investment</p>
            <p className='text-lg font-semibold text-gray-200'>₹ {totalInvestment.toFixed(2)}</p>
          </div>
          <div className='text-right'>
            <p className='text-xs text-gray-400'>Current Value</p>
            <p className='text-lg font-semibold text-gray-200'>₹ {totalCurrentValue.toFixed(2)}</p>
          </div>
          <div className={`text-right ${totalProfitLoss >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-lg px-3 py-2`}>
            <p className='text-xs text-gray-400'>Total P&L</p>
            <p className={`text-lg font-semibold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLoss.toFixed(2)}
              <span className='text-sm ml-1'>({totalProfitLossPercentage.toFixed(2)}%)</span>
            </p>
          </div>
        </div>
      </div>

      <div className='mb-6 flex justify-end'>
        <button
          onClick={handleManualRefresh}
          disabled={pricesLoading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all
            ${pricesLoading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
            }
            text-white shadow-lg
          `}
        >
          {pricesLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating Prices...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Prices
            </>
          )}
        </button>
      </div>

      <div className='hidden lg:block overflow-x-auto'>
        <div className='min-w-full'>
          <div className='flex w-full bg-gradient-to-r from-gray-800/50 to-indigo-900/30 rounded-t-xl border border-white/10'>
            <p className='text-xs font-semibold w-[10%] p-3 text-gray-300'>Instrument</p>
            <p className='text-xs font-semibold w-[8%] p-3 text-gray-300'>Qty.</p>
            <p className='text-xs font-semibold w-[10%] p-3 text-gray-300'>Avg. cost</p>
            <p className='text-xs font-semibold w-[10%] p-3 text-gray-300'>LTP</p>
            <p className='text-xs font-semibold w-[12%] p-3 text-gray-300'>Cur.val</p>
            <p className='text-xs font-semibold w-[12%] p-3 text-gray-300'>Investment</p>
            <p className='text-xs font-semibold w-[10%] p-3 text-gray-300'>P&L</p>
            <p className='text-xs font-semibold w-[10%] p-3 text-gray-300'>Returns</p>
            <p className='text-xs font-semibold w-[8%] p-3 text-gray-300'>Action</p>
          </div>

          <div className='border-x border-b border-white/10 rounded-b-xl overflow-hidden'>
            {holdings.map((holding, index) => {
              const { pnl, pnlPercentage, currentValue, currentPrice } = calculatePnL(holding);
              
              return (
                <div key={index} className='flex w-full hover:bg-white/5 transition-all duration-200 border-b border-white/5 last:border-b-0'>
                  <p className='text-xs w-[10%] p-3 text-gray-300 font-medium'>{holding.stockName}</p>
                  <p className='text-xs w-[8%] p-3 text-gray-400'>{holding.quantity}</p>
                  <p className='text-xs w-[10%] p-3 text-gray-400'>₹ {holding.avgPrice.toFixed(2)}</p>
                  <p className={`text-xs w-[10%] p-3 font-semibold ${currentPrice !== holding.avgPrice ? 'text-yellow-400' : 'text-gray-400'}`}>
                    ₹ {currentPrice.toFixed(2)}
                    {pricesLoading && <span className="ml-1 text-xs animate-pulse">🔄</span>}
                  </p>
                  <p className='text-xs w-[12%] p-3 text-gray-400'>₹ {currentValue.toFixed(2)}</p>
                  <p className='text-xs w-[12%] p-3 text-gray-400'>₹ {holding.totalCost.toFixed(2)}</p>
                  <p className={`text-xs w-[10%] p-3 font-semibold ${pnl < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                  </p>
                  <p className={`text-xs w-[10%] p-3 font-semibold ${pnlPercentage < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                  </p>
                  <p className='text-xs w-[8%] p-3'>
                    <button
                      onClick={() => handleSellClick(holding)}
                      className='bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-all'
                    >
                      Sell
                    </button>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className='lg:hidden space-y-4'>
        {holdings.map((holding, index) => {
          const { pnl, pnlPercentage, currentValue, currentPrice } = calculatePnL(holding);
          
          return (
            <div key={index} className='bg-gradient-to-br from-gray-800/50 to-indigo-900/30 border border-white/10 rounded-xl p-4 hover:scale-[1.02] transition-all duration-300'>
              <div className='flex justify-between items-start mb-3'>
                <h3 className='text-lg font-bold text-white'>{holding.stockName}</h3>
                <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${pnl >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  P&L: {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                </div>
              </div>
              
              <div className='grid grid-cols-2 gap-3 mb-3'>
                <div>
                  <p className='text-xs text-gray-400'>Quantity</p>
                  <p className='text-sm font-semibold text-gray-200'>{holding.quantity}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-400'>Avg. Cost</p>
                  <p className='text-sm font-semibold text-gray-200'>₹ {holding.avgPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-400'>LTP</p>
                  <p className={`text-sm font-semibold ${currentPrice !== holding.avgPrice ? 'text-yellow-400' : 'text-gray-200'}`}>
                    ₹ {currentPrice.toFixed(2)}
                    {pricesLoading && <span className="ml-1 text-xs animate-pulse">🔄</span>}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-400'>Current Value</p>
                  <p className='text-sm font-semibold text-gray-200'>₹ {currentValue.toFixed(2)}</p>
                </div>
              </div>
              
              <div className='flex justify-between items-center pt-3 border-t border-white/10'>
                <div>
                  <p className='text-xs text-gray-400'>Returns</p>
                  <p className={`text-sm font-semibold ${pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                  </p>
                </div>
                <button
                  onClick={() => handleSellClick(holding)}
                  className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all'
                >
                  Sell
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className='mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-gradient-to-br from-gray-800/30 to-indigo-900/30 border border-white/10 rounded-xl p-4 hover:scale-105 transition-all duration-300'>
          <p className='text-xs text-gray-400 mb-1'>Total Investment</p>
          <p className='text-2xl font-bold text-white'>₹ {totalInvestment.toFixed(2)}</p>
        </div>
        
        <div className='bg-gradient-to-br from-gray-800/30 to-indigo-900/30 border border-white/10 rounded-xl p-4 hover:scale-105 transition-all duration-300'>
          <p className='text-xs text-gray-400 mb-1'>Current Value</p>
          <p className='text-2xl font-bold text-white'>₹ {totalCurrentValue.toFixed(2)}</p>
        </div>
        
        <div className={`bg-gradient-to-br from-gray-800/30 ${totalProfitLoss >= 0 ? 'to-green-900/30' : 'to-red-900/30'} border border-white/10 rounded-xl p-4 hover:scale-105 transition-all duration-300`}>
          <p className='text-xs text-gray-400 mb-1'>Total P&L</p>
          <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalProfitLoss >= 0 ? '+' : ''}₹ {totalProfitLoss.toFixed(2)}
          </p>
        </div>
        
        <div className={`bg-gradient-to-br from-gray-800/30 ${totalProfitLossPercentage >= 0 ? 'to-green-900/30' : 'to-red-900/30'} border border-white/10 rounded-xl p-4 hover:scale-105 transition-all duration-300`}>
          <p className='text-xs text-gray-400 mb-1'>Total Returns %</p>
          <p className={`text-2xl font-bold ${totalProfitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalProfitLossPercentage >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      <SellModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stock={selectedStock}
        onSellSuccess={handleSellSuccess}
      />
    </div>
  );
};

export default Holdings;