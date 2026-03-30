import React, { useState, useEffect } from 'react'
import axios from 'axios';

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    axios.get(`${backendUrl}/allHoldings`).then((res) => {
      setAllHoldings(res.data);
    }).catch((error) => {
      console.error('Error fetching holdings:', error);
    });
  }, []);

  const totalCurrentValue = allHoldings.reduce((total, item) => {
    return total + (item.price * item.qty);
  }, 0);
  const totalInvestment = allHoldings.reduce((total, item) => {
    return total + (item.avg * item.qty);
  }, 0);
  
  const totalProfitLoss = totalCurrentValue - totalInvestment;
  const totalProfitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

  return (
    <div className='w-full px-4 sm:px-6 lg:px-8 py-6'>
      {/* Header Section */}
      <div className='flex justify-between items-center mb-6 pb-4 border-b border-white/10'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent'>
            Holdings
          </h1>
          <p className='text-sm text-gray-400 mt-1'>
            {allHoldings.length} {allHoldings.length === 1 ? 'Instrument' : 'Instruments'}
          </p>
        </div>
        
        {/* Summary Cards */}
        <div className='flex gap-4'>
          <div className='hidden sm:block text-right'>
            <p className='text-xs text-gray-400'>Total Investment</p>
            <p className='text-lg font-semibold text-gray-200'>₹ {totalInvestment.toFixed(2)}</p>
          </div>
          <div className='hidden sm:block text-right'>
            <p className='text-xs text-gray-400'>Current Value</p>
            <p className='text-lg font-semibold text-gray-200'>₹ {totalCurrentValue.toFixed(2)}</p>
          </div>
          <div className={`text-right ${totalProfitLoss >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-lg px-4 py-2`}>
            <p className='text-xs text-gray-400'>Total P&L</p>
            <p className={`text-lg font-semibold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLoss.toFixed(2)}
              <span className='text-sm ml-1'>({totalProfitLossPercentage.toFixed(2)}%)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className='hidden lg:block overflow-x-auto'>
        <div className='min-w-full'>
          {/* Table Header */}
          <div className='flex w-full bg-gradient-to-r from-gray-800/50 to-indigo-900/30 rounded-t-xl border border-white/10'>
            <p className='text-xs font-semibold w-[12%] p-3 text-gray-300'>Instrument</p>
            <p className='text-xs font-semibold w-[12%] p-3 text-gray-300'>Qty.</p>
            <p className='text-xs font-semibold w-[12%] p-3 text-gray-300'>Avg. cost</p>
            <p className='text-xs font-semibold w-[12%] p-3 text-gray-300'>LTP</p>
            <p className='text-xs font-semibold w-[12%] p-3 text-gray-300'>Cur.val</p>
            <p className='text-xs font-semibold w-[12%] p-3 text-gray-300'>P&L</p>
            <p className='text-xs font-semibold w-[12%] p-3 text-gray-300'>Net chg.</p>
            <p className='text-xs font-semibold w-[12%] p-3 text-gray-300'>Day chg.</p>
          </div>

          {/* Table Body */}
          <div className='border-x border-b border-white/10 rounded-b-xl overflow-hidden'>
            {allHoldings.map((item, index) => {
              const pnl = ((item.price - item.avg) * item.qty);
              const netChange = parseFloat(item.net);
              const dayChange = parseFloat(item.day);

              return (
                <div key={index} className='flex w-full hover:bg-white/5 transition-all duration-200 border-b border-white/5 last:border-b-0'>
                  <p className='text-xs w-[12%] p-3 text-gray-300 font-medium'>{item.name}</p>
                  <p className='text-xs w-[12%] p-3 text-gray-400'>{item.qty}</p>
                  <p className='text-xs w-[12%] p-3 text-gray-400'>₹ {item.avg.toFixed(2)}</p>
                  <p className='text-xs w-[12%] p-3 text-gray-400'>₹ {item.price.toFixed(2)}</p>
                  <p className='text-xs w-[12%] p-3 text-gray-400'>₹ {(item.price * item.qty).toFixed(2)}</p>
                  <p className={`text-xs w-[12%] p-3 font-semibold ${pnl < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                  </p>
                  <p className={`text-xs w-[12%] p-3 font-semibold ${netChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {netChange >= 0 ? '+' : ''}{item.net}
                  </p>
                  <p className={`text-xs w-[12%] p-3 font-semibold ${dayChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {dayChange >= 0 ? '+' : ''}{item.day}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Card View - Visible on mobile/tablet */}
      <div className='lg:hidden space-y-4'>
        {allHoldings.map((item, index) => {
          const pnl = ((item.price - item.avg) * item.qty);
          const netChange = parseFloat(item.net);
          const dayChange = parseFloat(item.day);

          return (
            <div key={index} className='bg-gradient-to-br from-gray-800/50 to-indigo-900/30 border border-white/10 rounded-xl p-4 hover:scale-[1.02] transition-all duration-300'>
              <div className='flex justify-between items-start mb-3'>
                <h3 className='text-lg font-bold text-white'>{item.name}</h3>
                <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${pnl >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  P&L: {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                </div>
              </div>
              
              <div className='grid grid-cols-2 gap-3 mb-3'>
                <div>
                  <p className='text-xs text-gray-400'>Quantity</p>
                  <p className='text-sm font-semibold text-gray-200'>{item.qty}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-400'>Avg. Cost</p>
                  <p className='text-sm font-semibold text-gray-200'>₹ {item.avg.toFixed(2)}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-400'>LTP</p>
                  <p className='text-sm font-semibold text-gray-200'>₹ {item.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-400'>Current Value</p>
                  <p className='text-sm font-semibold text-gray-200'>₹ {(item.price * item.qty).toFixed(2)}</p>
                </div>
              </div>
              
              <div className='grid grid-cols-2 gap-3 pt-3 border-t border-white/10'>
                <div>
                  <p className='text-xs text-gray-400'>Net Change</p>
                  <p className={`text-sm font-semibold ${netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {netChange >= 0 ? '+' : ''}{item.net}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-400'>Day Change</p>
                  <p className={`text-sm font-semibold ${dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {dayChange >= 0 ? '+' : ''}{item.day}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
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
    </div>
  )
}

export default Holdings