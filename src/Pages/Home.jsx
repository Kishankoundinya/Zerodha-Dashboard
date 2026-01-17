import React from 'react'
import Navbar from '../Component/Navbar'
import { Outlet } from 'react-router-dom'
import TopBar from '../Component/TopBar'

const Home = () => {
  return (
    <div className='flex min-h-screen bg-gray-50 text-gray-800 font-sans'>

      <div className='w-[40%] max-w-xs min-w-[250px] bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl'>
        <TopBar/>
      </div>
      

      <div className='w-[60%] flex-1'>

        <div className='h-16 w-full bg-white shadow-md border-b border-gray-200'>
          <Navbar />
        </div>
        

        <div className='h-[calc(100vh-64px)] w-full overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-white'>
          <div className='max-w-7xl mx-auto'>
            <Outlet/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home