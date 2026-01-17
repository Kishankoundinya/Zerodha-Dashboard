import React, { useState, useEffect } from 'react'
// import { holdings } from '../Data/data'
import axios from 'axios';

const Holdings = () => {
  const [allHoldings,setAllHoldings]=useState([]);

  useEffect(()=>{
    axios.get("http://localhost:3003/allHoldings").then((res)=>{
      setAllHoldings(res.data);
    })
  },[]);

  const totalCurrentValue = allHoldings.reduce((total, item) => {
    return total + (item.price * item.qty);
  }, 0);
  const totalInvestment = allHoldings.reduce((total, item) => {
    return total + (item.avg * item.qty);
  }, 0);
  return (
    <div className='w-full'>
      <div className='flex w-full pt-6 pl-10  justify-start items-center text-start'>
        <h1>Holdings ({allHoldings.length})</h1>
      </div>
      <div>
        <div className='flex w-full pt-3 justify-center items-center'>
          <p className='text-xs w-[12%] border-r-[0.25px] border-t-[0.25px] border-b-[0.25px] border-gray-300 text-gray-400 p-2'>Instrument</p>
          <p className='text-xs w-[12%] text-gray-400 border-t-[0.25px] border-b-[0.25px] border-gray-300 p-2'>Qty.</p>
          <p className='text-xs w-[12%] text-gray-400 border-t-[0.25px] border-b-[0.25px] border-gray-300 p-2'>Avg. cost</p>
          <p className='text-xs w-[12%] text-gray-400 border-t-[0.25px] border-r-[0.25px] border-gray-300 p-2 border-b-[0.25px]'>LTP</p>
          <p className='text-xs w-[12%] text-gray-400 border-t-[0.25px] border-b-[0.25px] border-gray-300 p-2'>Cur.val</p>
          <p className='text-xs w-[12%] text-gray-400 border-t-[0.25px] border-b-[0.25px] border-gray-300 p-2'>P&L</p>
          <p className='text-xs w-[12%] text-gray-400 border-t-[0.25px] border-b-[0.25px] border-gray-300 p-2'>Net chg.</p>
          <p className='text-xs w-[12%] text-gray-400 border-t-[0.25px] border-b-[0.25px] border-gray-300 p-2'>Day chg.</p>
        </div>

      </div>
      <div>
        {allHoldings.map((item, index) => {
          const pnl = ((item.price - item.avg) * item.qty);
          const netChange = parseFloat(item.net);
          const dayChange = parseFloat(item.day);

          return (
            <div key={index} className='flex w-full  justify-center items-center'>
              <p className='text-xs w-[12%] border-r-[0.25px] border-t-[0.25px] border-b-[0.25px] border-gray-300 text-gray-400 p-2'>{item.name}</p>
              <p className='text-xs w-[12%] text-gray-400 border-t-[0.25px] border-b-[0.25px] border-gray-300 p-2'>{item.qty}</p>
              <p className='text-xs w-[12%] text-gray-400 border-t-[0.25px] border-b-[0.25px] border-gray-300 p-2'>{item.avg.toFixed(2)}</p>
              <p className='text-xs w-[12%] text-gray-400 border-t-[0.25px] border-r-[0.25px] border-gray-300 p-2 border-b-[0.25px]'>{item.price.toFixed(2)}</p>
              <p className='text-xs w-[12%] text-gray-400 border-t-[0.25px] border-b-[0.25px] border-gray-300 p-2'>{(item.price * item.qty).toFixed(2)}</p>
              <p className={`text-xs w-[12%] border-t-[0.25px] border-b-[0.25px] border-gray-300 p-2 ${pnl < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {pnl.toFixed(2)}
              </p>
              <p className={`text-xs w-[12%] border-t-[0.25px] border-b-[0.25px] border-gray-300 p-2 ${netChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {item.net}
              </p>
              <p className={`text-xs w-[12%] border-t-[0.25px] border-b-[0.25px] border-gray-300 p-2 ${dayChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {item.day}
              </p>
            </div>
          );
        })}
      </div>
      <div className='flex'>
        <div className='p-10 mr-10 flex flex-col justify-center items-center'>
          <div className='flex items-baseline'>
            <span className='text-2xl text-gray-600'>
              {Math.floor(totalCurrentValue)}
            </span>
            <span className='text-sm text-gray-600'>
              .{(totalCurrentValue - Math.floor(totalCurrentValue)).toFixed(2).substring(2)}
            </span>
          </div>
          <p className='text-xs text-gray-400'>
            Total Investment
          </p>
        </div>
        <div className='p-10 flex flex-col justify-center items-center'>
          <div className='flex items-baseline'>
            <span className='text-2xl text-gray-600'>
              {Math.floor(totalInvestment)}
            </span>
            <span className='text-sm text-gray-600'>
              .{(totalInvestment - Math.floor(totalInvestment)).toFixed(2).substring(2)}
            </span>
          </div>
          <p className='text-xs text-gray-400'>
            Current value
          </p>
        </div>
      </div>
    </div>
  )
}

export default Holdings