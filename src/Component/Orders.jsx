import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const Orders = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    console.log('Orders component mounted');
    console.log('Location state:', location.state);
    
    const { symbol, currentPrice, companyName } = location.state || {};
    
    const [quantity, setQuantity] = useState(1);
    const [orderType, setOrderType] = useState('market');
    const [limitPrice, setLimitPrice] = useState(currentPrice || 0);
    
    const totalCost = orderType === 'market' 
        ? quantity * (currentPrice || 0)
        : quantity * limitPrice;
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const order = {
            symbol,
            companyName,
            quantity,
            orderType,
            price: orderType === 'market' ? currentPrice : limitPrice,
            total: totalCost,
            timestamp: new Date().toISOString()
        };
        
        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.post(
                '/api/orders/place-order',
                order,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );
            
            if (response.data.success) {
                console.log('Order placed successfully:', response.data);
                alert(`Order placed successfully!\n${quantity} shares of ${symbol} at $${order.price}\nNew Balance: $${response.data.data.newBalance.toFixed(2)}`);
                
                navigate('/portfolio', { 
                    state: { 
                        orderSuccess: true,
                        transaction: response.data.data.transaction,
                        newBalance: response.data.data.newBalance
                    }
                });
            }
        } catch (err) {
            console.error('Error placing order:', err);
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
            alert(`Error: ${err.response?.data?.message || 'Failed to place order'}`);
        } finally {
            setLoading(false);
        }
    };
    
    if (!symbol) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f1f] to-[#0a0a1a] flex items-center justify-center p-6">
                <div className="bg-gradient-to-br from-gray-800/40 to-indigo-900/20 rounded-2xl p-6 max-w-md border border-white/10 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold text-white mb-3">No Stock Selected</h2>
                    <p className="text-gray-400 mb-4">
                        Please select a stock from the dashboard to place an order.
                    </p>
                    <button
                        onClick={() => navigate('/home')}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f1f] to-[#0a0a1a] p-6">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors mb-6 group"
                >
                    <svg 
                        className="w-5 h-5 group-hover:-translate-x-1 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back</span>
                </button>

                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">Place Order</h2>
                
                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                        {error}
                    </div>
                )}
                
                <div className="mb-8 p-5 bg-gradient-to-br from-gray-800/40 to-indigo-900/20 rounded-xl border border-white/10 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-4">Stock Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-400">Company</p>
                            <p className="font-medium text-white">{companyName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Symbol</p>
                            <p className="font-medium text-indigo-400 font-mono">{symbol}</p>
                        </div>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6 bg-gradient-to-br from-gray-800/40 to-indigo-900/20 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                        <input 
                            type="number"
                            min="1"
                            step="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                            className="w-full bg-gray-800/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Order Type</label>
                        <select 
                            value={orderType}
                            onChange={(e) => setOrderType(e.target.value)}
                            className="w-full bg-gray-800/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="market">Market Order</option>
                            <option value="limit">Limit Order</option>
                        </select>
                    </div>
                    
                    {orderType === 'limit' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Limit Price ($)</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={limitPrice}
                                onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                                className="w-full bg-gray-800/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                required
                            />
                        </div>
                    )}
                    
                    <div className="border-t border-white/10 pt-4">
                        <h4 className="font-semibold text-white mb-3">Order Summary</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Quantity:</span>
                                <span className="text-white">{quantity} shares</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Price per share:</span>
                                <span className="text-white">${orderType === 'market' ? currentPrice?.toFixed(2) : limitPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                                <span className="text-gray-300">Total:</span>
                                <span className="text-green-400">${totalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                            loading 
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                        } text-white shadow-lg`}
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Orders;