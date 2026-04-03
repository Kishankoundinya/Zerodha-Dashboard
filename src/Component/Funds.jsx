import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet, 
  faPlus, 
  faMinus, 
  faHistory, 
  faIndianRupeeSign,
  faArrowUp,
  faArrowDown,
  faClock,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { AppContent } from '../Context/AppContext';

const Funds = () => {
  const { userData } = useContext(AppContent);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [processing, setProcessing] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003';

  // CREATE API INSTANCE WITH TOKEN INTERCEPTOR
  const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  });

  // CRITICAL: Add token to every request
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Funds - Token added for:', config.url);
      } else {
        console.log('❌ Funds - No token for:', config.url);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle 401 responses - redirect to login
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.log('Unauthorized - redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('isLoggedin');
        localStorage.removeItem('userData');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    fetchBalance();
    fetchTransactionHistory();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await api.get('/api/user/balance');
      
      if (response.data.success) {
        setBalance(response.data.data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const response = await api.get('/api/user/transactions');
      
      if (response.data.success) {
        setTransactionHistory(response.data.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  };

  const handleAddBalance = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/api/user/add-balance', 
        { amount: amountNum }
      );
      
      if (response.data.success) {
        setSuccess(`Successfully added ₹${amountNum.toFixed(2)} to your account`);
        setBalance(response.data.data.newBalance);
        setAmount('');
        setShowAddModal(false);
        fetchTransactionHistory();
      } else {
        setError(response.data.message || 'Failed to add balance');
      }
    } catch (error) {
      console.error('Error adding balance:', error);
      setError(error.response?.data?.message || 'Failed to add balance');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdrawBalance = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > balance) {
      setError(`Insufficient balance. Your current balance is ₹${balance.toFixed(2)}`);
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/api/user/withdraw-balance',
        { amount: amountNum }
      );
      
      if (response.data.success) {
        setSuccess(`Successfully withdrew ₹${amountNum.toFixed(2)} from your account`);
        setBalance(response.data.data.newBalance);
        setAmount('');
        setShowWithdrawModal(false);
        fetchTransactionHistory();
      } else {
        setError(response.data.message || 'Failed to withdraw balance');
      }
    } catch (error) {
      console.error('Error withdrawing balance:', error);
      setError(error.response?.data?.message || 'Failed to withdraw balance');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    if (type === 'credit') {
      return <FontAwesomeIcon icon={faArrowUp} className="text-green-400" />;
    } else {
      return <FontAwesomeIcon icon={faArrowDown} className="text-red-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading account information...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Funds Management
        </h1>
        <p className="text-gray-400 mt-2">Manage your account balance and view transactions</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 text-xl" />
            <p className="text-green-400">{success}</p>
          </div>
          <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-300">
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faTimesCircle} className="text-red-400 text-xl" />
            <p className="text-red-400">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
            ×
          </button>
        </div>
      )}

      {/* Account Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-gray-800/50 to-indigo-900/30 rounded-2xl border border-white/10 backdrop-blur-sm p-6 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faWallet} className="text-indigo-400 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Current Balance</p>
                <p className="text-3xl font-bold text-white">₹ {balance.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {/* Smaller Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              Add Balance
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={balance <= 0}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                balance > 0
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                  : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FontAwesomeIcon icon={faMinus} className="text-xs" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Account Details Card */}
        <div className="bg-gradient-to-br from-gray-800/50 to-indigo-900/30 rounded-2xl border border-white/10 backdrop-blur-sm p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faIndianRupeeSign} className="text-indigo-400" />
            Account Details
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-gray-400">Account Holder</span>
              <span className="text-white font-semibold">{userData?.name || 'User'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{userData?.email || 'user@example.com'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-gray-400">Available Balance</span>
              <span className="text-green-400 font-bold">₹ {balance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Total Transactions</span>
              <span className="text-white">{transactionHistory.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-gradient-to-br from-gray-800/50 to-indigo-900/30 rounded-2xl border border-white/10 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faHistory} className="text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Transaction History</h2>
        </div>

        {transactionHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-2">Add or withdraw funds to see your transaction history</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactionHistory.map((transaction, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className={`capitalize ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.type}
                        </span>
                      </div>
                     </td>
                    <td className="py-3">
                      <span className={transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}>
                        {transaction.type === 'credit' ? '+' : '-'} ₹ {transaction.amount.toFixed(2)}
                      </span>
                     </td>
                    <td className="py-3 text-gray-400 text-sm">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="text-xs" />
                        {formatDate(transaction.date)}
                      </div>
                     </td>
                    <td className="py-3">
                      <span className="text-green-400 text-sm bg-green-500/20 px-2 py-1 rounded-full">
                        Completed
                      </span>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Balance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-xl border border-white/20 max-w-md w-full shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Add Balance</h2>
              <form onSubmit={handleAddBalance}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Enter amount"
                    required
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setAmount('');
                      setError('');
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                      processing
                        ? 'bg-green-700/50 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    {processing ? 'Processing...' : 'Add Balance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Balance Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-xl border border-white/20 max-w-md w-full shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Withdraw Balance</h2>
              <form onSubmit={handleWithdrawBalance}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={balance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Enter amount"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Available balance: ₹ {balance.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setAmount('');
                      setError('');
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                      processing
                        ? 'bg-red-700/50 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    } text-white`}
                  >
                    {processing ? 'Processing...' : 'Withdraw'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Funds;