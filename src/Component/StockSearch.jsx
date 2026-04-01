import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import stockImg from '../assets/Images/search.svg'

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

    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003';

    useEffect(() => {
        testApiConnection();
        fetchMarketStatus();
    }, []);

    const testApiConnection = async () => {
        try {
            console.log('Testing API connection to:', API_BASE_URL);
            const response = await axios.get(`${API_BASE_URL}/api/stocks/test`);
            console.log('API connection successful:', response.data);
            setApiStatus({ connected: true, message: 'Connected to API' });
        } catch (err) {
            console.error('API connection failed:', err);
            setApiStatus({
                connected: false,
                message: `Cannot connect to API at ${API_BASE_URL}. Make sure backend is running.`
            });
            setError(`Cannot connect to backend server. Please ensure the backend is running on ${API_BASE_URL}`);
        }
    };

    const fetchMarketStatus = async () => {
        try {
            console.log('Fetching market status...');
            const response = await axios.get(`${API_BASE_URL}/api/stocks/market-status`);
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
            const response = await axios.get(`${API_BASE_URL}/api/stocks/search`, {
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
                axios.get(`${API_BASE_URL}/api/stocks/quote`, { params: { symbol } }).catch(err => {
                    console.error(`Quote fetch failed for ${symbol}:`, err);
                    return { data: null, error: err };
                }),
                axios.get(`${API_BASE_URL}/api/stocks/company-profile`, { params: { symbol } }).catch(err => {
                    console.error(`Profile fetch failed for ${symbol}:`, err);
                    return { data: null, error: err };
                }),
                axios.get(`${API_BASE_URL}/api/stocks/candles`, { params: { symbol, resolution: 'D' } }).catch(err => {
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
                <div className="border p-3 mb-4">
                    <p>{apiStatus.message}</p>
                </div>
            )}

            {marketStatus && (
                <div className="text-center p-2 mb-4 ">
                    <span>Market Status: </span>
                    <span className={marketStatus.isOpen ? 'text-green-600' : 'text-red-600'}>
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
                    className="flex-1 p-2 border rounded-sm"
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white disabled:bg-gray-400 rounded-sm"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error && (
                <div className="border p-3 mb-4 bg-red-50 text-red-700">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {searchResults.length > 0 && (
                <div className="border p-3 mb-4">
                    <h3 className="font-bold mb-2">
                        Search Results ({searchResults.length})
                    </h3>
                    <div>
                        {searchResults.map((result, index) => (
                            <div
                                key={index}
                                onClick={() => fetchStockData(result.symbol)}
                                className="p-2 border-b cursor-pointer hover:bg-blue-500"
                            >
                                <strong>{result.symbol}</strong>
                                <span> - {result.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading && (
                <div className="text-center py-4">
                    <div>Loading stock data...</div>
                </div>
            )}

            {isNoStockSelected && !loading && !error && (
                <div className="text-center py-4">
                    <img className="mx-auto animate-pulse" src={stockImg} alt="" />
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
                                <h2 className="text-xl font-bold">
                                    {stockData.profile?.name || selectedStock} ({selectedStock})
                                </h2>
                                {stockData.profile && (
                                    <p className="text-gray-600">
                                        {stockData.profile.exchange} • {stockData.profile.industry}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleBuyClick}
                            className="mt-2 w-full p-2 bg-green-600 text-white"
                        >
                            Buy Now
                        </button>
                    </div>

                    <div className="border p-3 mb-3">
                        <div className="text-center mb-2">
                            <span>Current Price</span>
                            <div className="text-2xl font-bold">{formatPrice(stockData.quote.c)}</div>
                        </div>
                        <div className="text-center mb-3">
                            {formatChange(stockData.quote.d, stockData.quote.dp)}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span>Open:</span>
                                <span className="ml-2 font-bold">{formatPrice(stockData.quote.o)}</span>
                            </div>
                            <div>
                                <span>High:</span>
                                <span className="ml-2 font-bold">{formatPrice(stockData.quote.h)}</span>
                            </div>
                            <div>
                                <span>Low:</span>
                                <span className="ml-2 font-bold">{formatPrice(stockData.quote.l)}</span>
                            </div>
                            <div>
                                <span>Prev Close:</span>
                                <span className="ml-2 font-bold">{formatPrice(stockData.quote.pc)}</span>
                            </div>
                        </div>
                    </div>

                    {stockData.profile?.weburl && (
                        <div className="border p-3">
                            <p className="mb-1">
                                <strong>Website:</strong>{' '}
                                <a
                                    href={stockData.profile.weburl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600"
                                >
                                    {stockData.profile.weburl}
                                </a>
                            </p>
                            {stockData.profile.ipo && (
                                <p className="mb-1">
                                    <strong>IPO Date:</strong> {stockData.profile.ipo}
                                </p>
                            )}
                            {stockData.profile.marketCapitalization && (
                                <p>
                                    <strong>Market Cap:</strong> ${(stockData.profile.marketCapitalization / 1000000000).toFixed(2)}B
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