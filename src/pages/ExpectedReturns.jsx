import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PackageX,
  Plus,
  TrendingDown,
  Clock,
  CheckCircle,
  Package,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import CenteredLoader from '../components/CenteredLoader';

const ExpectedReturns = () => {
  const [loading, setLoading] = useState(true);
  const [expectedReturns, setExpectedReturns] = useState([]);
  const [stats, setStats] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpectedReturns();
  }, [statusFilter]);

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const pollInterval = setInterval(() => {
      fetchExpectedReturns();
    }, 30000);

    // Refresh when window gains focus
    const handleFocus = () => {
      fetchExpectedReturns();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchExpectedReturns = async () => {
    try {
      setRefreshing(true);
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.get('/expected-returns', { params });
      setExpectedReturns(response.data.expectedReturns || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching expected returns:', error);
      toast.error('Failed to load expected returns');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (returnId, newStatus) => {
    try {
      const loadingToast = toast.loading('Updating status...');
      
      await api.patch(`/expected-returns/${returnId}/status`, {
        status: newStatus,
        actualReturnDate: newStatus === 'received' ? new Date() : null
      });

      toast.dismiss(loadingToast);
      
      if (newStatus === 'received') {
        toast.success('Return received! Stock has been added to warehouse with "returned" tag.');
      } else {
        toast.success(`Status updated to ${newStatus}`);
      }

      fetchExpectedReturns();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges.pending}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getConditionBadge = (condition) => {
    const badges = {
      unopened: 'bg-green-100 text-green-800',
      opened: 'bg-blue-100 text-blue-800',
      damaged: 'bg-red-100 text-red-800',
      defective: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[condition] || badges.opened}`}>
        {condition}
      </span>
    );
  };

  if (loading) {
    return <CenteredLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expected Returns</h1>
          <p className="text-gray-600 mt-1">Track products customers plan to return</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchExpectedReturns}
            disabled={refreshing}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={() => navigate('/expected-returns/new')}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expected Return
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <PackageX className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Expected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inTransit || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Received</p>
              <p className="text-2xl font-bold text-gray-900">{stats.received || 0}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Returns</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Expected Returns List */}
      {expectedReturns.length === 0 ? (
        <div className="card p-12 text-center">
          <PackageX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Expected Returns</h3>
          <p className="text-gray-600 mb-6">
            Track products that customers plan to return
          </p>
          <button
            onClick={() => navigate('/expected-returns/new')}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expected Return
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {expectedReturns.map((ret, index) => (
            <motion.div
              key={ret._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {ret.orderNumber}
                    </h3>
                    {getStatusBadge(ret.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Customer: <span className="font-medium">{ret.customerName}</span>
                  </p>
                  {ret.customerEmail && (
                    <p className="text-sm text-gray-600">{ret.customerEmail}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Expected Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(ret.expectedReturnDate).toLocaleDateString()}
                  </p>
                  {ret.actualReturnDate && (
                    <>
                      <p className="text-sm text-gray-600 mt-2">Received Date</p>
                      <p className="text-sm font-medium text-green-600">
                        {new Date(ret.actualReturnDate).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Return Items:</h4>
                <div className="space-y-2">
                  {ret.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.productId?.name || item.productName}
                        </p>
                        {item.variantName && (
                          <p className="text-sm text-gray-600">Variant: {item.variantName}</p>
                        )}
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        {item.reason && (
                          <p className="text-xs text-gray-500 mt-1">
                            Reason: {item.reason.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                      {getConditionBadge(item.condition)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Return Details */}
              {ret.returnReason && (
                <div className="mb-4 p-3 bg-yellow-50 rounded">
                  <p className="text-sm font-medium text-gray-700">Return Reason:</p>
                  <p className="text-sm text-gray-600">{ret.returnReason}</p>
                </div>
              )}

              {ret.warehouseId && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Warehouse: <span className="font-medium">{ret.warehouseId.name}</span>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                {ret.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange(ret._id, 'in_transit')}
                    className="btn-primary text-xs"
                  >
                    Mark In Transit
                  </button>
                )}
                
                {ret.status === 'in_transit' && (
                  <button
                    onClick={() => handleStatusChange(ret._id, 'received')}
                    className="btn-success text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1 inline" />
                    Mark Received
                  </button>
                )}
                
                {ret.status !== 'received' && ret.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusChange(ret._id, 'cancelled')}
                    className="btn-danger text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpectedReturns;

