import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SellModal = ({ isOpen, onClose, stock, onSellSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [sellingPrice, setSellingPrice] = useState('');
    const [currentPrice, setCurrentPrice] = useState(null);
    const [priceLoading, setPriceLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && stock) {
            fetchCurrentPrice();
            setQuantity(1);
            setError('');
        }
    }, [isOpen, stock]);

    const fetchCurrentPrice = async () => {
        if (!stock) return;
        
        setPriceLoading(true);
        try {
            console.log(`Fetching current price for ${stock.stockName}...`);
            const response = await axios.get('/api/stocks/quote', {
                params: { symbol: stock.stockName },
                withCredentials: true,
                timeout: 10000
            });
            
            console.log(`Price response for ${stock.stockName}:`, response.data);
            
            if (response.data && response.data.c) {
                const price = response.data.c;
                setCurrentPrice(price);
                setSellingPrice(price.toString());
                console.log(`Current price for ${stock.stockName}: ₹${price}`);
            } else {
                throw new Error('Invalid price data received');
            }
        } catch (error) {
            console.error('Error fetching current price:', error);
            setError('Failed to fetch current price. Please enter price manually.');
            setCurrentPrice(null);
            setSellingPrice('');
        } finally {
            setPriceLoading(false);
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 1 && value <= stock.quantity) {
            setQuantity(value);
        } else if (value > stock.quantity) {
            setQuantity(stock.quantity);
        } else if (value < 1) {
            setQuantity(1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (quantity > stock.quantity) {
            setError(`Cannot sell more than ${stock.quantity} shares`);
            setLoading(false);
            return;
        }

        if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
            setError('Please enter a valid selling price');
            setLoading(false);
            return;
        }

        const sellPrice = parseFloat(sellingPrice);

        try {
            const transactionId = stock.transactions[0]._id;

            const response = await axios.post('/api/orders/sell-stock', {
                transactionId,
                symbol: stock.stockName,
                quantity: quantity,
                sellingPrice: sellPrice
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                const profitLoss = response.data.data.profitLoss;
                const newBalance = response.data.data.newBalance;
                
                alert(` Successfully sold ${quantity} shares of ${stock.stockName}\n\n` +
                      `Selling Price: ₹${sellPrice.toFixed(2)}\n` +
                      `Total Value: ₹${(quantity * sellPrice).toFixed(2)}\n` +
                      `Profit/Loss: ${profitLoss >= 0 ? '+' : ''}₹${profitLoss.toFixed(2)}\n` +
                      `New Balance: ₹${newBalance.toFixed(2)}`);
                
                onSellSuccess();
                onClose();
            } else {
                throw new Error(response.data.message || 'Failed to sell stock');
            }
        } catch (err) {
            console.error('Error selling stock:', err);
            setError(err.response?.data?.message || err.message || 'Failed to sell stock');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !stock) return null;

    const totalValue = quantity * (parseFloat(sellingPrice) || 0);
    const totalInvestment = quantity * stock.avgPrice;
    const estimatedProfitLoss = totalValue - totalInvestment;
    const estimatedProfitLossPercentage = totalInvestment > 0 ? (estimatedProfitLoss / totalInvestment) * 100 : 0;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-xl border border-white/20 max-w-md w-full shadow-2xl animate-slideUp">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Sell {stock.stockName}</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3 mb-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-400">Available Quantity</p>
                                <p className="text-white font-semibold">{stock.quantity} shares</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Avg. Buy Price</p>
                                <p className="text-white font-semibold">₹{stock.avgPrice.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-3 mb-4 border border-indigo-500/30">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-400">Current Market Price</p>
                                {priceLoading ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400"></div>
                                        <span className="text-sm text-gray-400">Fetching price...</span>
                                    </div>
                                ) : (
                                    <p className="text-xl font-bold text-white">
                                        ₹{currentPrice ? currentPrice.toFixed(2) : '—'}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={fetchCurrentPrice}
                                disabled={priceLoading}
                                className="text-indigo-400 hover:text-indigo-300 text-sm disabled:opacity-50"
                            >
                                {priceLoading ? 'Fetching...' : 'Refresh'}
                            </button>
                        </div>
                        
                        {currentPrice && stock && (
                            <div className="mt-2 pt-2 border-t border-white/10">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">vs Purchase Price:</span>
                                    <span className={currentPrice >= stock.avgPrice ? 'text-green-400' : 'text-red-400'}>
                                        {currentPrice >= stock.avgPrice ? '+' : ''}
                                        ₹{(currentPrice - stock.avgPrice).toFixed(2)} 
                                        ({((currentPrice - stock.avgPrice) / stock.avgPrice * 100).toFixed(2)}%)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Quantity to Sell
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                    className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white w-10 h-10 rounded-lg font-bold transition-all"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max={stock.quantity}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    className="flex-1 bg-white/10 border border-white/20 rounded-lg p-2 text-white text-center focus:outline-none focus:border-indigo-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.min(stock.quantity, quantity + 1))}
                                    disabled={quantity >= stock.quantity}
                                    className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white w-10 h-10 rounded-lg font-bold transition-all"
                                >
                                    +
                                </button>
                            </div>
                            <div className="flex justify-between mt-2">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(1)}
                                    className="text-xs text-indigo-400 hover:text-indigo-300"
                                >
                                    Min (1)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setQuantity(stock.quantity)}
                                    className="text-xs text-indigo-400 hover:text-indigo-300"
                                >
                                    Max ({stock.quantity})
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Selling Price (per share)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">₹</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2 pl-7 text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="Enter price"
                                    required
                                />
                            </div>
                            {currentPrice && !priceLoading && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Current market price: ₹{currentPrice.toFixed(2)}
                                </p>
                            )}
                        </div>

                        <div className="bg-white/5 rounded-lg p-3 space-y-2">
                            <h3 className="text-sm font-semibold text-white mb-2">Sell Summary</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total Value:</span>
                                <span className="text-white font-semibold">₹{totalValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total Investment:</span>
                                <span className="text-white font-semibold">₹{totalInvestment.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                                <span className="text-gray-400">Estimated P&L:</span>
                                <span className={`font-semibold ${estimatedProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {estimatedProfitLoss >= 0 ? '+' : ''}₹{estimatedProfitLoss.toFixed(2)}
                                    <span className="text-xs ml-1">
                                        ({estimatedProfitLossPercentage.toFixed(2)}%)
                                    </span>
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || priceLoading}
                            className={`w-full py-2 rounded-lg font-semibold transition-all ${
                                loading || priceLoading
                                    ? 'bg-gray-600 cursor-not-allowed' 
                                    : 'bg-red-600 hover:bg-red-700'
                            } text-white`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : priceLoading ? (
                                'Fetching Price...'
                            ) : (
                                `Sell ${quantity} Share${quantity > 1 ? 's' : ''}`
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellModal;