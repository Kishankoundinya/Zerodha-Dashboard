// StockPriceChart.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContent } from '../Context/AppContext';

const StockPriceChart = () => {
    const [symbol, setSymbol] = useState('AAPL');
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const { userData } = useContext(AppContent);

    useEffect(() => {
        // Don't fetch on mount if searchInput is empty
        if (searchInput.trim()) {
            fetchStockData(searchInput);
        }
    }, []);

    const fetchStockData = async (searchSymbol) => {
        if (!searchSymbol.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`http://localhost:3003/api/stock-data?symbol=${searchSymbol}`);
            setStockData(response.data);
            setSymbol(searchSymbol.toUpperCase());
            
            // Update watchlist with the searched stock
            await axios.post('http://localhost:3003/api/user/watchlist', { 
                stockData: response.data 
            });
            
        } catch (err) {
            setError(`Failed to fetch data: ${err.message}`);
            setStockData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            fetchStockData(searchInput.trim());
        }
    };

    const getSummaryStats = () => {
        if (!stockData?.data?.length) return null;

        const prices = stockData.data.map(d => d.close);
        const lastData = stockData.data[stockData.data.length - 1];
        const firstData = stockData.data[0];

        return {
            currentPrice: lastData.close,
            openPrice: firstData.open,
            dailyHigh: Math.max(...prices),
            dailyLow: Math.min(...prices),
            priceChange: lastData.close - firstData.open,
            percentChange: ((lastData.close - firstData.open) / firstData.open) * 100
        };
    };

    const stats = getSummaryStats();

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                        placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!searchInput.trim()}
                    >
                        Search
                    </button>
                </div>

                {/* Quick Symbols */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'].map((sym) => (
                        <button
                            key={sym}
                            onClick={() => {
                                setSearchInput(sym);
                                fetchStockData(sym);
                            }}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                        >
                            {sym}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading stock data...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Conditional Rendering */}
            {searchInput === "" ? (
                <div className="text-center py-12">
                    <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                        <span className="text-4xl">🔍</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Search your stock</h3>
                    <p className="text-gray-500">Enter a stock symbol above to see real-time data</p>
                </div>
            ) : (
                stockData && !loading && stats && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{stockData.symbol}</h2>
                                    <p className="text-sm text-gray-500">Today's Data</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        ${stats.currentPrice.toFixed(2)}
                                    </div>
                                    <div className={`text-sm font-medium ${stats.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {stats.priceChange >= 0 ? '▲' : '▼'} ${Math.abs(stats.priceChange).toFixed(2)} ({Math.abs(stats.percentChange).toFixed(2)}%)
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">Open</div>
                                    <div className="font-semibold">${stats.openPrice.toFixed(2)}</div>
                                </div>
                                <div className="bg-green-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">High</div>
                                    <div className="font-semibold text-green-700">${stats.dailyHigh.toFixed(2)}</div>
                                </div>
                                <div className="bg-red-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">Low</div>
                                    <div className="font-semibold text-red-700">${stats.dailyLow.toFixed(2)}</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">Range</div>
                                    <div className="font-semibold">{((stats.dailyHigh - stats.dailyLow) / stats.openPrice * 100).toFixed(1)}%</div>
                                </div>
                            </div>
                            <div>
                                {/* Watchlist Display */}
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        My Watchlist ({userData?.Watchlist?.length || 0} stocks)
                                    </h3>

                                    {userData?.Watchlist && userData.Watchlist.length > 0 ? (
                                        <div className="space-y-3">
                                            {userData.Watchlist.map((stock, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {/* Stock number */}
                                                        <span className="text-sm text-gray-500 w-6 text-center">
                                                            {index + 1}
                                                        </span>

                                                        {/* Stock symbol */}
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {stock.symbol || stock}
                                                            </div>
                                                            {/* If stock is an object with additional data */}
                                                            {stock.companyName && (
                                                                <div className="text-xs text-gray-500">
                                                                    {stock.companyName}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Additional info if available */}
                                                        {stock.priceAtAddition && (
                                                            <div className="text-sm">
                                                                <span className="text-gray-500">Added at: </span>
                                                                <span className="font-medium">${stock.priceAtAddition.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {/* Action buttons */}
                                                        <button
                                                            onClick={() => {
                                                                setSearchInput(stock.symbol || stock);
                                                                fetchStockData(stock.symbol || stock);
                                                            }}
                                                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                                            <div className="inline-block p-3 bg-gray-100 rounded-full mb-3">
                                                <span className="text-xl">⭐</span>
                                            </div>
                                            <p className="text-gray-600">No stocks in your watchlist yet</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Search for stocks above and add them to your watchlist
                                            </p>
                                        </div>
                                    )}

                                    {/* Watchlist stats/info */}
                                    {userData?.Watchlist && userData.Watchlist.length > 0 && (
                                        <div className="mt-4 text-sm text-gray-500">
                                            <p>Click "View" to see detailed data for any stock</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}

            {/* Show when search has input but no data yet */}
            {searchInput !== "" && !stockData && !loading && !error && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No data available for "{searchInput}"</p>
                    <p className="text-sm text-gray-400 mt-2">Try searching for a valid stock symbol</p>
                </div>
            )}
        </div>
    );
};

export default StockPriceChart;