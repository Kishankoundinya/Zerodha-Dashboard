import React from 'react';
import WatchList from './WatchList';

const TopBar = () => {
    return (
        <div className='md:w-[100%] w-full bg-gray-100  border-r border-gray-300 h-screen flex flex-col'>
            
            <div className='flex border-b border-gray-300 bg-white shrink-0 p-3.5'>
                <div className='w-[50%] flex justify-center items-center py-2'>
                    <h1 className='text-gray-500 text-sm mr-2'>NIFTY 50</h1>
                    <p className='text-red-500 text-sm font-medium'>100.2</p>
                </div>
                <div className='w-[50%] flex justify-center items-center py-2'>
                    <h1 className='text-gray-500 text-sm mr-2'>SENSEX</h1>
                    <p className='text-red-500 text-sm font-medium'>100.2</p>
                </div>
            </div>
            
            
            <div className="flex-1 overflow-hidden ">
                <WatchList />
            </div>
        </div>
    );
};

export default TopBar;