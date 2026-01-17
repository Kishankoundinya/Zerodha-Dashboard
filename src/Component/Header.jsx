import React from 'react'
import { useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons'
import { AppContent } from '../Context/AppContext'

const Header = () => {
  const { userData } = useContext(AppContent)
  
 return (
    <div className='w-full' >
        <div className='mt-5 pb-3 m-5 border-b-gray-300 border-b-1'>
            <h1 className='text-2xl'>Hi, {userData?userData.name:'User'}!</h1>
        </div>
        <div className='mt-5 pb-3 m-5 border-b-gray-300 border-b-1'>
            <div className='flex items-center'>
            
                <FontAwesomeIcon className='text-gray-400' icon={faClock} />
                <h1 className='ml-2 '>Equity</h1>

            </div>
            <div className='flex  items-center'>
                <div className='h-full p-15 flex flex-col justify-center items-center'>
                        <h2 className='text-4xl text-gray-600'>3.74k</h2>
                        <p className='text-xs text-gray-400'>Margin Available</p>
                </div>
                <div className='border-[0.5px] h-20 border-gray-200'></div>
                <div className='h-full p-20'>
                <p className='text-gray-400 text-xs mb-2'>Margin used 0</p>
                <p className='text-gray-400 text-xs'>Opening balance 3.74k</p>
                </div>
            </div>
        </div>
        <div className='mt-5 pb-3 m-5 border-b-gray-300 border-b-1'>
            <div className='flex items-center'>
            
                <FontAwesomeIcon className='text-gray-400' icon={faCreditCard} />
                <h1 className='ml-2 '>Holdings (13)</h1>

            </div>
            <div className='flex  items-center'>
                <div className='h-full p-15 flex flex-col justify-center items-center'>
                        <h2 className='text-4xl flex items-baseline-last text-green-500'>1.55k<p className='text-sm ml-2'>+5.20%</p></h2>
                        <p className='text-xs text-gray-400'>P&L</p>
                </div>
                <div className='border-[0.5px] h-20 border-gray-200'></div>
                <div className='h-full p-20'>
                <p className='text-gray-400 text-xs mb-2 flex'>Current Value <span className='ml-2 text-black'>31.43k</span></p>
                <p className='text-gray-400 text-xs flex'>Investment <span className='ml-2 text-black'>29.88k</span></p>
                </div>
            </div>

        </div>
    </div>
  )
}

export default Header