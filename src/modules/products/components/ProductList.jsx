import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Loader2,
  X,
  AlertCircle,
  Grid3X3,
  List,
  Calendar,
  DollarSign,
  Tag
} from 'lucide-react';
import ProductDetail from './ProductDetail';
import CenteredLoader from '../../../components/CenteredLoader';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.products || response.data);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (productData) => {
    try {
      const response = await api.post('/products', productData);
      setProducts([...products, response.data]);
      navigate('/products');
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  };

  const handleUpdate = async (productData, productId) => {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      setProducts(products.map(p => p._id === productId ? response.data : p));
      navigate('/products');
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const openDeleteModal = (product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, product: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    
    try {
      await api.delete(`/products/${deleteModal.product._id}`);
      setProducts(products.filter(p => p._id !== deleteModal.product._id));
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-500', bgColor: 'bg-red-100' };
    if (stock <= 5) return { text: 'Low Stock', color: 'text-yellow-500', bgColor: 'bg-yellow-100' };
    return { text: 'In Stock', color: 'text-green-500', bgColor: 'bg-green-100' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'stock': return b.currentStock - a.currentStock;
      case 'price': return b.sellingPrice - a.sellingPrice;
      default: return 0;
    }
  });

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return <CenteredLoader message="Loading products..." size="large" />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        {/* Title Section - Full width on mobile, auto width on larger screens */}
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your inventory products</p>
        </div>
        
        {/* Controls Section - Full width on mobile, auto width on larger screens */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              List
            </button>
          </div>
          <button
            onClick={() => navigate('/products/new')}
            className="btn-primary flex items-center flex-1 sm:flex-initial justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Products Count and Filters */}
      <div className="card p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{sortedProducts.length}</span> of <span className="font-semibold text-gray-900">{products.length}</span> products
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="name">Sort by Name</option>
            <option value="stock">Sort by Stock</option>
            <option value="price">Sort by Price</option>
          </select>
          <button
            onClick={fetchProducts}
            className="btn-secondary flex items-center justify-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => {
            const totalStock = product.warehouses?.reduce((sum, w) => sum + w.stock, 0) || 0;
            const { text: stockText, color: stockColor, bgColor: stockBgColor } = getStockStatus(totalStock);
            
            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-primary-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/products/${product._id}/edit`)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(product)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit:</span>
                    <span className="font-medium">{product.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost Price:</span>
                    <span className="font-medium">PKR {product.costPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selling Price:</span>
                    <span className="font-medium">PKR {product.sellingPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stock:</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${stockBgColor} ${stockColor}`}>
                      {totalStock} units - {stockText}
                    </div>
                  </div>
                </div>

                {product.warehouses && product.warehouses.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Stock by Warehouse:</h4>
                    <div className="space-y-1">
                      {product.warehouses.map((warehouse, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{warehouse.name}:</span>
                          <span className="font-medium">{warehouse.stock} units</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedProducts.map((product) => {
                  const totalStock = product.warehouses?.reduce((sum, w) => sum + w.stock, 0) || 0;
                  const { text: stockText, color: stockColor, bgColor: stockBgColor } = getStockStatus(totalStock);
                  
                  return (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-8 w-8 text-primary-600 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.sku}</div>
                            <div className="text-xs text-gray-400">{product.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{product.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">PKR {product.costPrice}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">PKR {product.sellingPrice}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stockBgColor} ${stockColor}`}>
                            {totalStock} units - {stockText}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(product.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="text-gray-400 hover:text-primary-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/products/${product._id}/edit`)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or add a new product.</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          productId={selectedProduct._id}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={closeDeleteModal}
                style={{ zIndex: 9998 }}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
              >
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Delete Product
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteModal.product?.name}"</span>? 
                    This action cannot be undone and will permanently remove the product from your inventory.
                  </p>
                  
                  {deleteModal.product && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">SKU:</span>
                          <span className="ml-2 font-medium">{deleteModal.product.sku}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-2 font-medium">{deleteModal.product.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Cost Price:</span>
                          <span className="ml-2 font-medium">PKR {deleteModal.product.costPrice}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Selling Price:</span>
                          <span className="ml-2 font-medium">PKR {deleteModal.product.sellingPrice}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={closeDeleteModal}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Delete Product
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductList;
