import React from 'react'
import Navbar from '../Component/Navbar'
import { Outlet } from 'react-router-dom'


const Home = () => {
  return (
    <div className='flex min-h-screen bg-gray-50 text-gray-800 font-sans'>

      

      <div className='w-[60%] flex-1'>

        <div className='h-16 w-full bg-[#00001b] shadow-md border-b border-gray-200'>
          <Navbar />
        </div>
        

        <div className='h-[calc(100vh-64px)] w-full overflow-y-auto p-6 bg-[#00001b] text-white'>
          <div className='max-w-7xl mx-auto  '>
            <Outlet/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home