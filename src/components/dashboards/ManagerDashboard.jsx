import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Warehouse,
  ShoppingCart,
  Truck,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Activity,
  Eye
} from 'lucide-react';
import api from '../../services/api';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalWarehouses: 0,
    totalSales: 0,
    totalPurchases: 0,
    lowStockProducts: 0,
    monthlyRevenue: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch data accessible to managers
      const [productsRes, warehousesRes, salesRes, purchasesRes] = await Promise.all([
        api.get('/products'),
        api.get('/warehouses'),
        api.get('/sales'),
        api.get('/purchases')
      ]);

      const products = productsRes.data.products || productsRes.data || [];
      const warehouses = warehousesRes.data.warehouses || warehousesRes.data || [];
      const sales = salesRes.data.sales || salesRes.data || [];
      const purchases = purchasesRes.data.purchases || purchasesRes.data || [];

      // Calculate low stock products
      const lowStockProducts = products.filter(p => p.currentStock <= 5).length;

      // Calculate monthly revenue
      const monthlyRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

      setStats({
        totalProducts: products.length,
        totalWarehouses: warehouses.length,
        totalSales: sales.length,
        totalPurchases: purchases.length,
        lowStockProducts,
        monthlyRevenue,
        pendingOrders: 5 // Mock data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'blue',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Warehouses',
      value: stats.totalWarehouses,
      icon: Warehouse,
      color: 'purple',
      change: '+1',
      changeType: 'positive'
    },
    {
      title: 'Low Stock Alert',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'red',
      change: '-2',
      changeType: 'negative'
    },
    {
      title: 'Monthly Revenue',
      value: `PKR ${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'emerald',
      change: '+10%',
      changeType: 'positive'
    },
    {
      title: 'Total Sales',
      value: stats.totalSales,
      icon: Truck,
      color: 'indigo',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: ShoppingCart,
      color: 'orange',
      change: '+3',
      changeType: 'negative'
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
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-2">Inventory and operations management</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Operations Active</span>
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
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
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
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
            <Package className="h-8 w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Manage Products</span>
          </button>
          <button className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
            <Warehouse className="h-8 w-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Warehouse Status</span>
          </button>
          <button className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group">
            <ShoppingCart className="h-8 w-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Process Orders</span>
          </button>
          <button className="p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 group">
            <BarChart3 className="h-8 w-8 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Operations</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Stock updated for Product A</p>
              <p className="text-xs text-gray-500">5 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <div className="p-2 bg-green-100 rounded-lg">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New sale completed</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Low stock alert - Product B</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
