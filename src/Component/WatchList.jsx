import React, { useState } from 'react';
import { Tooltip, Grow } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { watchlist } from '../../../backend/Data/data';

const WatchList = () => {
    return (
        <div className="h-full flex flex-col">
            
            <div className='flex items-center border-b border-gray-300 bg-white px-4 py-3 shrink-0'>
                <div className='flex-1 mr-3'>
                    <input 
                        type="text" 
                        name='search' 
                        id='search' 
                        className='w-full text-gray-600 text-sm outline-none placeholder:text-gray-400'
                        placeholder='Search eg: infy, bse, nifty fut weekly, gold mex' 
                    />
                </div>
                <div className='text-gray-400 text-xs font-medium whitespace-nowrap'>
                    {watchlist.length}/10
                </div>
            </div>
            
           
            <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-gray-100">
                    {watchlist.map((stock, index) => (
                        <WatchListItem stock={stock} key={index} />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default WatchList;

const WatchListItem = ({ stock }) => {
    const [showWatchlistActions, setShowWatchlistActions] = useState(false);
    
    const handleMouseEnter = () => {
        setShowWatchlistActions(true);
    };
    
    const handleMouseLeave = () => {
        setShowWatchlistActions(false);
    };

    return (
        <li 
            className='relative group hover:bg-gray-100 transition-colors duration-150 m-3'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave} 
        >
            <div className='flex items-center justify-between px-4 py-3'>
     
                <div className="flex-1 min-w-0 mr-4">
                    <p className={`text-sm font-medium truncate ${stock.isDown ? "text-red-600" : "text-green-600"}`}>
                        {stock.name}
                    </p>
                </div>
                
           
                <div className='flex items-center space-x-3 flex-shrink-0'>
                    <span className={`text-sm font-medium ${stock.isDown ? "text-red-500" : "text-green-500"}`}>
                        {stock.percent}
                    </span>
                    {stock.isDown ? (
                        <KeyboardArrowDown className='text-red-500 w-4 h-4' />
                    ) : (
                        <KeyboardArrowUp className='text-green-500 w-4 h-4' />
                    )}
                    <span className={`text-sm font-semibold w-16 text-right ${stock.isDown ? "text-red-600" : "text-green-600"}`}>
                        {stock.price}
                    </span>
                </div>
            </div>
            
           
            {showWatchlistActions && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                    <WatchlistActions />
                </div>
            )}
        </li>
    );
};

const WatchlistActions = () => {
    return (
        <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-md shadow-sm border border-gray-200">
            <Tooltip title="Buy (B)" placement="top" arrow TransitionComponent={Grow}>
                <button className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors focus:outline-none focus:ring-1 focus:ring-green-300 min-w-[45px]">
                    Buy
                </button>
            </Tooltip>
            <Tooltip title="Sell (S)" placement="top" arrow TransitionComponent={Grow}>
                <button className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors focus:outline-none focus:ring-1 focus:ring-red-300 min-w-[45px]">
                    Sell
                </button>
            </Tooltip>
        </div>
    );
};