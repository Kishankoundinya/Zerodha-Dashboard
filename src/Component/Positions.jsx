import React,{useState,useEffect} from 'react'
// import { positions } from '../Data/data'
import axios from 'axios';


const Positions = () => {
    const [allPositions,setAllPositions]=useState([]);
     useEffect(()=>{
    axios.get("http://localhost:3003/allpositions").then((res)=>{
      setAllPositions(res.data);
    })
  },[]);
  const formatNumber = (num) => {
    const [integer, decimal] = parseFloat(num).toFixed(2).split('.')
    return (
      <>
        <span className="text-base">{integer}</span>
        <span className="text-xs text-gray-500">.{decimal}</span>
      </>
    )
  }

 
  const calculateTotalPNL = () => {
    return allPositions.reduce((total, item) => {
      return total + parseFloat(item.net)
    }, 0)
  }

  const totalPNL = calculateTotalPNL()

  return (
    <div className='bg-white w-full'>
      <div className='px-6 py-4 m-3 border-b border-gray-200'>
        <h1 className="text-lg font-semibold text-gray-800">allPositions ({allPositions.length})</h1>
      </div>
      
      <div className="overflow-x-auto m-3">
        
        <div className='flex w-full min-w-200  bg-gray-50 border-b border-gray-200'>
          {['Product', 'Instrument', 'Qty.', 'Avg.', 'LTP', 'P&L', 'Chg.'].map((header, idx) => (
            <div 
              key={header}
              className={`text-xs font-medium text-gray-500 p-3 ${
                idx === 0 ? 'w-[20%] pl-6' : 'w-[12%]'
              } ${idx === 6 ? 'pr-6' : ''}`}
            >
              {header}
            </div>
          ))}
        </div>
        
        
        <div className="divide-y divide-gray-100">
          {allPositions.map((item, index) => {
            const net = parseFloat(item.net)
            const day = parseFloat(item.day)
            
            return (
              <div key={index} className='flex w-full min-w-200 hover:bg-gray-50'>
                
                <div className='w-[20%] p-3 pl-6'>
                  <span className={`inline-flex items-center justify-center w-16 px-2 py-1 text-xs font-medium rounded-md ${
                    item.isLoss 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {item.product}
                  </span>
                </div>
                
                
                <div className='w-[12%] p-3'>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                
                
                <div className='w-[12%] p-3'>
                  <span className="text-sm font-medium text-gray-900">{item.qty}</span>
                </div>
                
                
                <div className='w-[12%] p-3'>
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(item.avg)}
                  </div>
                </div>
                
                
                <div className='w-[12%] p-3'>
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(item.price)}
                  </div>
                </div>
                
                
                <div className='w-[12%] p-3'>
                  <div className={`text-sm font-medium ${net < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {net < 0 ? '▼ ' : '▲ '}
                    {formatNumber(Math.abs(net))}
                  </div>
                </div>
                
                
                <div className='w-[12%] p-3 pr-6'>
                  <div className={`text-sm font-medium ${day < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {day < 0 ? '▼ ' : '▲ '}
                    {formatNumber(Math.abs(day))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Total P&L Row */}
        <div className='flex w-full min-w-200 border-t border-gray-200 bg-gray-50'>
          <div className='w-[20%] p-3 pl-6'>
            
          </div>
          
          <div className='w-[12%] p-3'></div>
          <div className='w-[12%] p-3'></div>
          <div className='w-[12%] p-3'></div>
          <div className='w-[12%] p-3'><span className="text-md font-medium text-gray-700">Total</span></div>
          
          <div className='w-[12%] p-3'>
            <div className='text-sm font-medium' >
              {formatNumber(Math.abs(totalPNL))}
            </div>
          </div>
          
          <div className='w-[12%] p-3 pr-6'>
            <div className="text-sm font-medium text-gray-900">
              -
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Positions