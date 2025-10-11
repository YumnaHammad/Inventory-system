import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  FileText,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  RotateCcw,
  Warehouse,
  DollarSign
} from 'lucide-react';
import api from '../services/api';
import { BarChart, PieChart } from '../components/charts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [mainReport, setMainReport] = useState(null);
  const [weeklySales, setWeeklySales] = useState(null);
  const [monthlyInventory, setMonthlyInventory] = useState(null);
  const [supplierPerformance, setSupplierPerformance] = useState(null);
  const [returnAnalysis, setReturnAnalysis] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, reportRes] = await Promise.all([
        api.get('/reports/dashboard/summary'),
        api.get('/reports/dashboard/main')
      ]);
      setDashboardSummary(summaryRes.data);
      setMainReport(reportRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklySales = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/weekly-sales');
      setWeeklySales(response.data);
    } catch (error) {
      console.error('Error fetching weekly sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyInventory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/monthly-inventory');
      setMonthlyInventory(response.data);
    } catch (error) {
      console.error('Error fetching monthly inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierPerformance = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/supplier-performance', {
        params: dateRange
      });
      setSupplierPerformance(response.data);
    } catch (error) {
      console.error('Error fetching supplier performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReturnAnalysis = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/return-analysis', {
        params: dateRange
      });
      setReturnAnalysis(response.data);
    } catch (error) {
      console.error('Error fetching return analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Fetch data based on selected tab
    switch (tab) {
      case 'weekly-sales':
        if (!weeklySales) fetchWeeklySales();
        break;
      case 'monthly-inventory':
        if (!monthlyInventory) fetchMonthlyInventory();
        break;
      case 'supplier-performance':
        if (!supplierPerformance) fetchSupplierPerformance();
        break;
      case 'return-analysis':
        if (!returnAnalysis) fetchReturnAnalysis();
        break;
      default:
        break;
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Report', icon: BarChart3 },
    { id: 'weekly-sales', label: 'Weekly Sales', icon: TrendingUp },
    { id: 'monthly-inventory', label: 'Monthly Inventory', icon: Package },
    { id: 'supplier-performance', label: 'Supplier Performance', icon: Truck },
    { id: 'return-analysis', label: 'Return Analysis', icon: RotateCcw }
  ];

  const renderDashboardReport = () => {
    if (!dashboardSummary || !mainReport) return null;

  return (
    <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardSummary.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Items in Stock</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardSummary.totalItemsInStock.toLocaleString()}</p>
              </div>
              <Warehouse className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered This Week</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardSummary.deliveredProducts.thisWeek}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
        <div>
                <p className="text-sm font-medium text-gray-600">Returns This Week</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardSummary.returns.thisWeek}</p>
              </div>
              <RotateCcw className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Main Report Table */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Product Stock Overview</h3>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Critical: {mainReport.summary.criticalAlerts}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                Out of Stock: {mainReport.summary.outOfStock}
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Warning: {mainReport.summary.warningAlerts}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Good: {mainReport.summary.goodStock}
              </span>
        </div>
      </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Current Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Weekly Sales</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Monthly Sales</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Days Left</th>
                </tr>
              </thead>
              <tbody>
                {mainReport.report.slice(0, 20).map((item, index) => {
                  const getAlertColor = (alert) => {
                    switch (alert) {
                      case 'critical': return 'text-red-600';
                      case 'warning': return 'text-yellow-600';
                      case 'out_of_stock': return 'text-gray-600';
                      default: return 'text-green-600';
                    }
                  };

                  const getAlertIcon = (alert) => {
                    switch (alert) {
                      case 'critical':
                      case 'warning':
                        return <AlertTriangle className="w-4 h-4" />;
                      case 'out_of_stock':
                        return <XCircle className="w-4 h-4" />;
                      default:
                        return <CheckCircle className="w-4 h-4" />;
                    }
                  };

                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">{item.productSku}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{item.currentStock}</span>
                        <span className="text-sm text-gray-600 ml-1">{item.unit}</span>
                      </td>
                      <td className="py-3 px-4">{item.weeklySales}</td>
                      <td className="py-3 px-4">{item.monthlySales}</td>
                      <td className="py-3 px-4">
          <div className="flex items-center">
                          <span className={`${getAlertColor(item.stockAlert)}`}>
                            {getAlertIcon(item.stockAlert)}
                          </span>
                          <span className={`ml-2 text-sm font-medium ${getAlertColor(item.stockAlert)}`}>
                            {item.stockAlert === 'critical' ? 'Critical' :
                             item.stockAlert === 'warning' ? 'Warning' :
                             item.stockAlert === 'out_of_stock' ? 'Out of Stock' :
                             'Good'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {item.daysOfInventory < 999 ? `${item.daysOfInventory} days` : '∞'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklySalesReport = () => {
    if (!weeklySales) return null;

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products Sold</p>
                <p className="text-2xl font-bold text-gray-900">{weeklySales.summary.totalProductsSold}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{weeklySales.summary.totalQuantitySold}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{weeklySales.summary.totalOrders}</p>
              </div>
              <Truck className="w-8 h-8 text-indigo-600" />
            </div>
            </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">PKR {weeklySales.summary.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Sales Performance</h3>
          <div className="h-64">
            <BarChart
              data={weeklySales.productSales.slice(0, 10)}
              dataKey="quantitySold"
              nameKey="productName"
              color="#3b82f6"
            />
            </div>
          </div>

        {/* Top Products */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {weeklySales.productSales.slice(0, 10).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600">SKU: {product.productSku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{product.quantitySold} {product.unit}</p>
                  <p className="text-sm text-gray-600">{product.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlyInventoryReport = () => {
    if (!monthlyInventory) return null;

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyInventory.summary.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Opening Value</p>
                <p className="text-2xl font-bold text-gray-900">PKR {monthlyInventory.summary.totalOpeningValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Closing Value</p>
                <p className="text-2xl font-bold text-gray-900">PKR {monthlyInventory.summary.totalClosingValue.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Change</p>
                <p className={`text-2xl font-bold ${monthlyInventory.summary.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyInventory.summary.netChange >= 0 ? '+' : ''}{monthlyInventory.summary.netChange}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Inventory Movement</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Opening Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Stock In</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Stock Out</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Closing Stock</th>
                </tr>
              </thead>
              <tbody>
                {monthlyInventory.inventory.slice(0, 20).map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">{item.productSku}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{item.openingStock}</td>
                    <td className="py-3 px-4 text-green-600">{item.stockIn}</td>
                    <td className="py-3 px-4 text-red-600">{item.stockOut}</td>
                    <td className="py-3 px-4 font-medium">{item.closingStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
            </div>
    );
  };

  const renderSupplierPerformanceReport = () => {
    if (!supplierPerformance) return null;

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{supplierPerformance.summary.totalSuppliers}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900">{supplierPerformance.summary.totalPurchases}</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
            </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">PKR {supplierPerformance.summary.totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
            </div>
          </div>

        {/* Supplier Performance Table */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total Purchases</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Order Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Delivery Performance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">On-Time Performance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Rating</th>
                </tr>
              </thead>
              <tbody>
                {supplierPerformance.suppliers.map((supplier, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{supplier.supplierName}</p>
                        <p className="text-sm text-gray-600">{supplier.supplierCode}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{supplier.totalPurchases}</td>
                    <td className="py-3 px-4">PKR {supplier.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4">PKR {supplier.averageOrderValue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${supplier.deliveryPerformance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{supplier.deliveryPerformance}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
          <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${supplier.onTimePerformance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{supplier.onTimePerformance}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.rating === 'A' ? 'bg-green-100 text-green-800' :
                        supplier.rating === 'B' ? 'bg-blue-100 text-blue-800' :
                        supplier.rating === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {supplier.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderReturnAnalysisReport = () => {
    if (!returnAnalysis) return null;

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">{returnAnalysis.summary.totalReturns}</p>
              </div>
              <RotateCcw className="w-8 h-8 text-orange-600" />
            </div>
            </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">Return Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{returnAnalysis.summary.totalReturnQuantity}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{returnAnalysis.summary.totalSales}</p>
              </div>
              <Truck className="w-8 h-8 text-green-600" />
            </div>
      </div>

      <div className="card p-6">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">Return Rate</p>
                <p className="text-2xl font-bold text-gray-900">{returnAnalysis.summary.returnRate}%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Return Reasons Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Reasons</h3>
          <div className="h-64">
            <PieChart
              data={returnAnalysis.returnReasons}
              dataKey="count"
              nameKey="reason"
            />
          </div>
        </div>

        {/* Top Returned Products */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Returned Products</h3>
          <div className="space-y-4">
            {returnAnalysis.productReturns.slice(0, 10).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600">SKU: {product.productSku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{product.returnQuantity} returns</p>
                  <p className="text-sm text-gray-600">{product.returnCount} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive business insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                console.log(`Refreshing ${activeTab} report data...`);
                switch (activeTab) {
                  case 'dashboard':
                    fetchDashboardData();
                    break;
                  case 'weekly-sales':
                    fetchWeeklySales();
                    break;
                  case 'monthly-inventory':
                    fetchMonthlyInventory();
                    break;
                  case 'supplier-performance':
                    fetchSupplierPerformance();
                    break;
                  case 'return-analysis':
                    fetchReturnAnalysis();
                    break;
                  default:
                    break;
                }
              }}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              title="Refresh current report data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && renderDashboardReport()}
          {activeTab === 'weekly-sales' && renderWeeklySalesReport()}
          {activeTab === 'monthly-inventory' && renderMonthlyInventoryReport()}
          {activeTab === 'supplier-performance' && renderSupplierPerformanceReport()}
          {activeTab === 'return-analysis' && renderReturnAnalysisReport()}
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;