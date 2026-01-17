import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';

const Oders = () => {
  return (
    <div className='flex flex-col items-center w-full h-full'>
        <FontAwesomeIcon icon={faBookOpen} size={'5x'} className='text-gray-400 p-10' />
        <p className='text-sm text-gray-400 mb-3'>You haven't placed any orders today</p>
        <a className='bg-indigo-500 text-white w-25 p-1 text-center rounded-sm' href="">Get Started</a>
    </div>
  )
}

export default Oders