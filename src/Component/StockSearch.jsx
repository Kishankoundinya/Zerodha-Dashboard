import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import stockImg from '../assets/Images/Search.svg'

const StockSearch = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [stockData, setStockData] = useState({
        quote: null,
        profile: null,
        candles: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [marketStatus, setMarketStatus] = useState(null);
    const [apiStatus, setApiStatus] = useState(null);

    useEffect(() => {
        testApiConnection();
        fetchMarketStatus();
    }, []);

    const testApiConnection = async () => {
        try {
            console.log('Testing API connection...');
            const response = await axios.get('/api/stocks/test');
            console.log('API connection successful:', response.data);
            setApiStatus({ connected: true, message: 'Connected to API' });
        } catch (err) {
            console.error('API connection failed:', err);
            setApiStatus({
                connected: false,
                message: 'Cannot connect to API. Make sure backend is running.'
            });
            setError('Cannot connect to backend server. Please ensure the backend is running.');
        }
    };

    const fetchMarketStatus = async () => {
        try {
            console.log('Fetching market status...');
            const response = await axios.get('/api/stocks/market-status');
            console.log('Market status response:', response.data);
            setMarketStatus(response.data);
        } catch (err) {
            console.error('Error fetching market status:', err);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setError('Please enter a stock symbol or company name');
            return;
        }

        setLoading(true);
        setError('');
        setSearchResults([]);

        try {
            console.log(`Searching for: ${searchQuery}`);
            const response = await axios.get('/api/stocks/search', {
                params: { query: searchQuery }
            });
            console.log('Search response:', response.data);

            if (response.data.result && response.data.result.length > 0) {
                setSearchResults(response.data.result);
            } else {
                setError('No stocks found. Try a different symbol or name.');
            }
        } catch (err) {
            console.error('Search error details:', err);
            if (err.response) {
                console.error('Response data:', err.response.data);
                console.error('Response status:', err.response.status);
                setError(`Search failed: ${err.response.data.error || err.response.statusText}`);
            } else if (err.request) {
                console.error('No response received:', err.request);
                setError('Cannot connect to server. Please check if backend is running.');
            } else {
                setError(`Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStockData = async (symbol) => {
        setLoading(true);
        setError('');

        try {
            console.log(`Fetching data for symbol: ${symbol}`);

            const requests = [
                axios.get('/api/stocks/quote', { params: { symbol } }).catch(err => {
                    console.error(`Quote fetch failed for ${symbol}:`, err);
                    return { data: null, error: err };
                }),
                axios.get('/api/stocks/company-profile', { params: { symbol } }).catch(err => {
                    console.error(`Profile fetch failed for ${symbol}:`, err);
                    return { data: null, error: err };
                }),
                axios.get('/api/stocks/candles', { params: { symbol, resolution: 'D' } }).catch(err => {
                    console.error(`Candles fetch failed for ${symbol}:`, err);
                    return { data: null, error: err };
                })
            ];

            const [quoteRes, profileRes, candlesRes] = await Promise.all(requests);

            if (!quoteRes.data) {
                throw new Error('Failed to fetch stock quote data');
            }

            setStockData({
                quote: quoteRes.data,
                profile: profileRes.data,
                candles: candlesRes.data
            });

            setSelectedStock(symbol);
            setSearchResults([]);

            if (!profileRes.data) {
                console.warn('Company profile data not available');
            }

        } catch (err) {
            console.error('Error fetching stock data:', err);
            setError(`Failed to fetch data for ${symbol}: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleBuyClick = () => {
        if (selectedStock && stockData.quote) {
            navigate('/home/orders', {
                state: {
                    symbol: selectedStock,
                    currentPrice: stockData.quote.c,
                    companyName: stockData.profile?.name || selectedStock
                }
            });
        }
    };

    const formatPrice = (price) => {
        if (price === undefined || price === null) return 'N/A';
        return `$${price.toFixed(2)}`;
    };

    const formatChange = (change, changePercent) => {
        if (change === undefined || change === null) return 'N/A';
        const isPositive = change >= 0;
        return (
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent?.toFixed(2)}%)
            </span>
        );
    };

    const isNoStockSelected = !selectedStock && !stockData.quote && searchResults.length === 0 && !loading;

    return (
        <div className="p-4">
            {apiStatus && !apiStatus.connected && (
                <div className="border p-3 mb-4 bg-red-50 text-red-700 rounded">
                    <p>{apiStatus.message}</p>
                </div>
            )}

            {marketStatus && (
                <div className="text-center p-2 mb-4 bg-gray-100 rounded">
                    <span>Market Status: </span>
                    <span className={marketStatus.isOpen ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {marketStatus.isOpen ? 'Open' : 'Closed'}
                    </span>
                </div>
            )}

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter stock symbol or company name (e.g., AAPL, Microsoft)"
                    className="flex-1 p-2 border rounded-sm bg-gray-800 text-white"
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white disabled:bg-gray-400 rounded-sm hover:bg-indigo-700 transition"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error && (
                <div className="border p-3 mb-4 bg-red-500/10 text-red-400 rounded">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {searchResults.length > 0 && (
                <div className="border p-3 mb-4 bg-gray-800/50 rounded">
                    <h3 className="font-bold mb-2 text-white">
                        Search Results ({searchResults.length})
                    </h3>
                    <div>
                        {searchResults.map((result, index) => (
                            <div
                                key={index}
                                onClick={() => fetchStockData(result.symbol)}
                                className="p-2 border-b border-gray-700 cursor-pointer hover:bg-indigo-500/20 text-white"
                            >
                                <strong>{result.symbol}</strong>
                                <span className="text-gray-400"> - {result.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading && (
                <div className="text-center py-4 text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-2"></div>
                    <div>Loading stock data...</div>
                </div>
            )}

            {isNoStockSelected && !loading && !error && (
                <div className="text-center py-4">
                    <img className="mx-auto animate-pulse opacity-50" src={stockImg} alt="Search for stocks" />
                    <p className="text-gray-500 mt-2">Search for a stock to get started</p>
                </div>
            )}

            {selectedStock && stockData.quote && (
                <div className="mt-4">
                    <div className="border-b pb-2 mb-3">
                        <div>
                            {stockData.profile?.logo && (
                                <img
                                    src={stockData.profile.logo}
                                    alt={stockData.profile.name}
                                    className="w-12 h-12 object-contain inline-block mr-2"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}
                            <div className="inline-block">
                                <h2 className="text-xl font-bold text-white">
                                    {stockData.profile?.name || selectedStock} ({selectedStock})
                                </h2>
                                {stockData.profile && (
                                    <p className="text-gray-400">
                                        {stockData.profile.exchange} • {stockData.profile.industry}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleBuyClick}
                            className="mt-2 w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                            Buy Now
                        </button>
                    </div>

                    <div className="border p-3 mb-3 bg-gray-800/30 rounded">
                        <div className="text-center mb-2">
                            <span className="text-gray-400">Current Price</span>
                            <div className="text-2xl font-bold text-white">{formatPrice(stockData.quote.c)}</div>
                        </div>
                        <div className="text-center mb-3">
                            {formatChange(stockData.quote.d, stockData.quote.dp)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-gray-300">
                            <div>
                                <span className="text-gray-400">Open:</span>
                                <span className="ml-2 font-bold">{formatPrice(stockData.quote.o)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">High:</span>
                                <span className="ml-2 font-bold">{formatPrice(stockData.quote.h)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Low:</span>
                                <span className="ml-2 font-bold">{formatPrice(stockData.quote.l)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Prev Close:</span>
                                <span className="ml-2 font-bold">{formatPrice(stockData.quote.pc)}</span>
                            </div>
                        </div>
                    </div>

                    {stockData.profile?.weburl && (
                        <div className="border p-3 bg-gray-800/30 rounded">
                            <p className="mb-1 text-gray-300">
                                <strong className="text-gray-400">Website:</strong>{' '}
                                <a
                                    href={stockData.profile.weburl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-400 hover:text-indigo-300"
                                >
                                    {stockData.profile.weburl}
                                </a>
                            </p>
                            {stockData.profile.ipo && (
                                <p className="mb-1 text-gray-300">
                                    <strong className="text-gray-400">IPO Date:</strong> {stockData.profile.ipo}
                                </p>
                            )}
                            {stockData.profile.marketCapitalization && (
                                <p className="text-gray-300">
                                    <strong className="text-gray-400">Market Cap:</strong> ${(stockData.profile.marketCapitalization / 1000000000).toFixed(2)}B
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StockSearch;