import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, TrendingUp, DollarSign, Calendar, Clock, Filter, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import CenteredLoader from '../components/CenteredLoader';
import { useLocation, useNavigate } from 'react-router-dom';
import SalesFormPage from './forms/SalesFormPage';
import api from '../services/api';
import ExportButton from '../components/ExportButton';

const Sales = () => {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [newlyAddedSaleId, setNewlyAddedSaleId] = useState(null);
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalDelivered: 0,
    totalReturns: 0,
    totalRevenue: 0
  });
  const [timeFilter, setTimeFilter] = useState('all'); // all, day, week, month
  const [refreshing, setRefreshing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch sales data
  const fetchSales = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/sales?limit=1000'); // Fetch all sales
      let salesData = response.data?.salesOrders || [];
      
      // Check for temporary sales in localStorage (newly created ones)
      const tempSales = JSON.parse(localStorage.getItem('tempSales') || '[]');
      if (tempSales.length > 0) {
        // Merge temporary sales with API data, avoiding duplicates
        const apiSaleIds = new Set(salesData.map(s => s._id));
        const newTempSales = tempSales.filter(s => !apiSaleIds.has(s._id));
        salesData = [...newTempSales, ...salesData];
        
        // Clear temporary sales after merging
        localStorage.removeItem('tempSales');
      }
      
      // Always use real data from API, even if empty
      setSales(salesData);
      
      // Calculate stats from real data (will be 0 if no sales)
      const stats = {
        totalSales: salesData.length,
        totalDelivered: salesData.filter(sale => sale.status === 'delivered').length,
        totalReturns: salesData.filter(sale => sale.status === 'returned').length,
        totalRevenue: salesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
      };
      
      setSalesStats(stats);
      
      // Debug: Log the received data
      console.log('Sales API Response:', response.data);
      console.log('Sales Data:', salesData);
      console.log('Number of sales:', salesData.length);
      
      // If no real data exists, show a helpful message instead of dummy data
      if (salesData.length === 0) {
        console.log('No sales found in database');
      } else {
        console.log('Successfully loaded', salesData.length, 'sales from database');
      }
      
    } catch (error) {
      console.error('Error fetching sales:', error);
      // Only use dummy data if API is completely unavailable
      console.log('API unavailable, using dummy data for demonstration');
      const dummySales = [
        {
          _id: '1',
          orderNumber: 'SO-0001',
          customerId: { name: 'ABC Corporation' },
          customerName: 'ABC Corporation',
          items: [
            { productId: { name: 'Laptop Dell XPS 13' }, quantity: 2, unitPrice: 95000, totalPrice: 190000 },
            { productId: { name: 'Wireless Mouse' }, quantity: 2, unitPrice: 3500, totalPrice: 7000 }
          ],
          totalAmount: 197000,
          status: 'delivered',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          notes: 'Corporate order for new employees',
          paymentMethod: 'Bank Transfer'
        },
        {
          _id: '2',
          orderNumber: 'SO-0002',
          customerId: { name: 'XYZ Tech Solutions' },
          customerName: 'XYZ Tech Solutions',
          items: [
            { productId: { name: 'Office Chair' }, quantity: 5, unitPrice: 18000, totalPrice: 90000 },
            { productId: { name: 'Desk Lamp' }, quantity: 5, unitPrice: 4500, totalPrice: 22500 }
          ],
          totalAmount: 112500,
          status: 'delivered',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          notes: 'Office setup for new branch',
          paymentMethod: 'Credit Card'
        },
        {
          _id: '3',
          orderNumber: 'SO-0003',
          customerId: { name: 'Startup Inc' },
          customerName: 'Startup Inc',
          items: [
            { productId: { name: 'Monitor 24" LED' }, quantity: 3, unitPrice: 28000, totalPrice: 84000 },
            { productId: { name: 'Keyboard Mechanical' }, quantity: 3, unitPrice: 9500, totalPrice: 28500 }
          ],
          totalAmount: 112500,
          status: 'shipped',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
          deliveryDate: null,
          notes: 'Equipment for startup office',
          paymentMethod: 'Online Payment'
        },
        {
          _id: '4',
          orderNumber: 'SO-0004',
          customerId: { name: 'Individual Customer' },
          customerName: 'Ahmed Ali',
          items: [
            { productId: { name: 'A4 Paper (500 sheets)' }, quantity: 10, unitPrice: 1000, totalPrice: 10000 },
            { productId: { name: 'Blue Pens (Box of 12)' }, quantity: 5, unitPrice: 1500, totalPrice: 7500 },
            { productId: { name: 'Notebooks (A5)' }, quantity: 8, unitPrice: 600, totalPrice: 4800 }
          ],
          totalAmount: 22300,
          status: 'delivered',
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
          deliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          notes: 'Personal office supplies',
          paymentMethod: 'Cash on Delivery'
        },
        {
          _id: '5',
          orderNumber: 'SO-0005',
          customerId: { name: 'Green Office Ltd' },
          customerName: 'Green Office Ltd',
          items: [
            { productId: { name: 'Disinfectant Spray' }, quantity: 8, unitPrice: 1500, totalPrice: 12000 },
            { productId: { name: 'Paper Towels (Pack of 12)' }, quantity: 4, unitPrice: 2200, totalPrice: 8800 }
          ],
          totalAmount: 20800,
          status: 'returned',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
          deliveryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          notes: 'Returned due to damaged packaging',
          paymentMethod: 'Bank Transfer'
        },
        {
          _id: '6',
          orderNumber: 'SO-0006',
          customerId: { name: 'Tech Hub' },
          customerName: 'Tech Hub',
          items: [
            { productId: { name: 'Laptop Dell XPS 13' }, quantity: 1, unitPrice: 95000, totalPrice: 95000 },
            { productId: { name: 'Office Chair' }, quantity: 1, unitPrice: 18000, totalPrice: 18000 },
            { productId: { name: 'Monitor 24" LED' }, quantity: 1, unitPrice: 28000, totalPrice: 28000 }
          ],
          totalAmount: 141000,
          status: 'pending',
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
          deliveryDate: null,
          notes: 'Complete workstation setup',
          paymentMethod: 'Bank Transfer'
        },
        {
          _id: '7',
          orderNumber: 'SO-0007',
          customerId: { name: 'Home Office Solutions' },
          customerName: 'Home Office Solutions',
          items: [
            { productId: { name: 'Wireless Mouse' }, quantity: 15, unitPrice: 3500, totalPrice: 52500 },
            { productId: { name: 'Keyboard Mechanical' }, quantity: 15, unitPrice: 9500, totalPrice: 142500 }
          ],
          totalAmount: 195000,
          status: 'delivered',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          deliveryDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
          notes: 'Bulk order for home office packages',
          paymentMethod: 'Credit Card'
        }
      ];
      
      setSales(dummySales);
      
      // Calculate stats from dummy data
      const stats = {
        totalSales: dummySales.length,
        totalDelivered: dummySales.filter(sale => sale.status === 'delivered').length,
        totalReturns: dummySales.filter(sale => sale.status === 'returned').length,
        totalRevenue: dummySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
      };
      
      setSalesStats(stats);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Check for temporary sales on component mount
  useEffect(() => {
    const tempSales = JSON.parse(localStorage.getItem('tempSales') || '[]');
    if (tempSales.length > 0) {
      // Add temporary sales to the current state
      setSales(prev => {
        const existingIds = new Set(prev.map(s => s._id));
        const newSales = tempSales.filter(s => !existingIds.has(s._id));
        if (newSales.length > 0) {
          // Update stats
          setSalesStats(prevStats => {
            const newStats = { ...prevStats };
            newSales.forEach(sale => {
              newStats.totalSales += 1;
              newStats.totalDelivered += (sale.status === 'delivered' ? 1 : 0);
              newStats.totalReturns += (sale.status === 'returned' ? 1 : 0);
              newStats.totalRevenue += sale.totalAmount || 0;
            });
            return newStats;
          });
          
          // Highlight the most recent sale
          if (newSales[0]) {
            setNewlyAddedSaleId(newSales[0]._id);
            setTimeout(() => setNewlyAddedSaleId(null), 3000);
          }
          
          return [...newSales, ...prev];
        }
        return prev;
      });
      
      // Clear temporary sales after adding to state
      localStorage.removeItem('tempSales');
    }
  }, []);

  // Refresh data when navigating back from sales form
  useEffect(() => {
    if (location.state?.refresh) {
      fetchSales();
      // Clear the refresh state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Refresh data when component becomes visible (e.g., after navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSales();
      }
    };

    const handleFocus = () => {
      fetchSales();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Handle card clicks
  const handleCardClick = (cardType) => {
    switch (cardType) {
      case 'total':
        console.log('Viewing all sales orders');
        // You can add navigation to a detailed view here
        break;
      case 'delivered':
        console.log('Viewing delivered orders');
        // Filter to show only delivered orders
        break;
      case 'returns':
        console.log('Viewing returned orders');
        // Filter to show only returned orders
        break;
      case 'revenue':
        console.log('Viewing revenue details');
        // Navigate to revenue analytics
        break;
      default:
        break;
    }
  };

  // Filter sales by time period
  const getFilteredSales = () => {
    if (timeFilter === 'all') return sales;
    
    const now = new Date();
    let filterDate;
    
    switch (timeFilter) {
      case 'day':
        filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '90days':
        filterDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        filterDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return sales;
    }
    
    return sales.filter(sale => new Date(sale.createdAt) >= filterDate);
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
    console.log(`Filter changed to: ${newFilter}`);
    // The filtered data will update automatically via getFilteredSales()
  };

  // Handle refresh button click
  const handleRefresh = () => {
    console.log('Refreshing sales data...');
    fetchSales();
  };

  // Export sales data
  const handleExportSales = async (format = 'excel') => {
    const { exportSales } = await import('../utils/exportUtils');
    return exportSales(getFilteredSales(), format);
  };

  if (loading) {
    return <CenteredLoader message="Loading sales..." size="large" />;
  }

  const isNew = location.pathname === '/sales/new';
  if (isNew) {
    return (
      <div className="max-w-3xl mx-auto">
        <SalesFormPage 
          onSuccess={(newSale) => {
            // Add the new sale to state immediately
            setSales(prev => [newSale, ...prev]);
            
            // Highlight the newly added sale
            setNewlyAddedSaleId(newSale._id);
            
            // Clear highlight after 3 seconds
            setTimeout(() => setNewlyAddedSaleId(null), 3000);
            
            // Update stats immediately
            setSalesStats(prev => ({
              totalSales: prev.totalSales + 1,
              totalDelivered: prev.totalDelivered + (newSale.status === 'delivered' ? 1 : 0),
              totalReturns: prev.totalReturns + (newSale.status === 'returned' ? 1 : 0),
              totalRevenue: prev.totalRevenue + (newSale.totalAmount || 0)
            }));
            
            navigate('/sales');
          }} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        {/* Title Section - Full width on mobile */}
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your sales and orders</p>
        </div>
        
        {/* Controls Section - Full width on mobile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <ExportButton
            data={getFilteredSales()}
            filename="sales"
            title="Sales Report"
            exportFunction={handleExportSales}
            variant="default"
            buttonText="Export"
          />
          <button 
            className="btn-primary flex items-center flex-1 sm:flex-initial justify-center" 
            onClick={() => {
              console.log('New Sales Order button clicked');
              console.log('Current location:', location.pathname);
              console.log('Navigating to: /sales/new');
              try {
                navigate('/sales/new');
                console.log('Navigation command executed');
              } catch (error) {
                console.error('Navigation error:', error);
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Sales Order</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleCardClick('total')}
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-lg mr-4">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{salesStats.totalSales}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleCardClick('delivered')}
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{salesStats.totalDelivered}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleCardClick('returns')}
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-500 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Returns</p>
              <p className="text-2xl font-bold text-gray-900">{salesStats.totalReturns}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleCardClick('revenue')}
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-500 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">PKR {salesStats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Debug Info Panel - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Debug Information</h3>
          <div className="text-xs text-blue-800 space-y-1">
            <p>Total Sales in State: {sales.length}</p>
            <p>Filtered Sales: {getFilteredSales().length}</p>
            <p>Current Filter: {timeFilter}</p>
            <p>API Endpoint: /sales?limit=1000</p>
            <p>Last Refresh: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      )}

      {/* Sales Records Section */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Sales Records ({getFilteredSales().length} of {sales.length} total)
          </h2>
          <div className="flex items-center space-x-3">
            <select
              value={timeFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh sales data"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {getFilteredSales().length === 0 ? (
          <div className="text-center py-8">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No sales found</p>
            <p className="text-gray-400 text-sm mt-2">
              {timeFilter === 'all' ? 'Start by creating your first sales order to see real data' : `No sales found for the selected ${timeFilter} period`}
            </p>
            <button
              onClick={() => {
                console.log('Create Your First Sales Order button clicked');
                navigate('/sales/new');
              }}
              className="btn-primary mt-4"
            >
              Create Your First Sales Order
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredSales().map((sale) => (
              <motion.div
                key={sale._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 ${
                  newlyAddedSaleId === sale._id 
                    ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-200' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-semibold text-gray-900">{sale.orderNumber}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        sale.status === 'returned' ? 'bg-red-100 text-red-800' :
                        sale.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sale.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 mr-2" />
                        <span>{sale.items?.length || 0} items</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="font-medium">PKR {sale.totalAmount?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        {sale.status === 'delivered' ? <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> :
                         sale.status === 'returned' ? <XCircle className="w-4 h-4 mr-2 text-red-600" /> :
                         <Clock className="w-4 h-4 mr-2 text-yellow-600" />}
                        <span className="capitalize">{sale.status}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-2">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {sale.items?.slice(0, 3).map((item, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                          >
                            {item.productId?.name || 'Unknown Product'} (x{item.quantity})
                          </span>
                        ))}
                        {sale.items?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{sale.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-2">
                      Customer: {sale.customerId?.name || sale.customerName || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {sale.deliveryDate ? `Delivered: ${new Date(sale.deliveryDate).toLocaleDateString()}` : 'Not delivered yet'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
