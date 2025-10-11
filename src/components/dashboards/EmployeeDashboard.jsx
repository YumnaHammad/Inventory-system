import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingCart,
  Truck,
  Eye,
  TrendingUp,
  AlertTriangle,
  Activity,
  CheckCircle
} from 'lucide-react';
import api from '../../services/api';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({
    assignedTasks: 0,
    completedTasks: 0,
    productsToProcess: 0,
    ordersToFulfill: 0,
    lowStockItems: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch data accessible to employees
      const [productsRes, salesRes] = await Promise.all([
        api.get('/products'),
        api.get('/sales')
      ]);

      const products = productsRes.data.products || productsRes.data || [];
      const sales = salesRes.data.sales || salesRes.data || [];

      // Calculate low stock products
      const lowStockItems = products.filter(p => p.currentStock <= 5).length;

      setStats({
        assignedTasks: 8,
        completedTasks: 5,
        productsToProcess: products.length,
        ordersToFulfill: sales.filter(s => s.status === 'pending').length,
        lowStockItems,
        recentActivity: [
          { action: 'Product restocked', time: '10 minutes ago', type: 'success' },
          { action: 'Order processed', time: '1 hour ago', type: 'info' },
          { action: 'Low stock alert', time: '2 hours ago', type: 'warning' }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Assigned Tasks',
      value: stats.assignedTasks,
      icon: Activity,
      color: 'blue',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'Completed Today',
      value: stats.completedTasks,
      icon: CheckCircle,
      color: 'green',
      change: '+1',
      changeType: 'positive'
    },
    {
      title: 'Products to Process',
      value: stats.productsToProcess,
      icon: Package,
      color: 'purple',
      change: '+5',
      changeType: 'positive'
    },
    {
      title: 'Orders to Fulfill',
      value: stats.ordersToFulfill,
      icon: Truck,
      color: 'orange',
      change: '-2',
      changeType: 'negative'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'red',
      change: '+1',
      changeType: 'negative'
    },
    {
      title: 'Pending Reviews',
      value: 3,
      icon: Eye,
      color: 'indigo',
      change: '+1',
      changeType: 'positive'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600 mt-2">Your tasks and daily operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Tasks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
            <Package className="h-8 w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Process Products</span>
          </button>
          <button className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group">
            <ShoppingCart className="h-8 w-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Fulfill Orders</span>
          </button>
          <button className="p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
            <Truck className="h-8 w-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Update Inventory</span>
          </button>
          <button className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
            <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Review Items</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className={`p-2 rounded-lg ${
                activity.type === 'success' ? 'bg-green-100' :
                activity.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                <Activity className={`h-5 w-5 ${
                  activity.type === 'success' ? 'text-green-600' :
                  activity.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
