import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Package,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const ProductFormPage = ({ product, onSubmit, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit: 'pcs',
    costPrice: '',
    sellingPrice: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatingSKU, setGeneratingSKU] = useState(false);
  const [error, setError] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    fetchWarehouses();
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        unit: product.unit || 'pcs',
        costPrice: product.costPrice || '',
        sellingPrice: product.sellingPrice || '',
        description: product.description || ''
      });
    }
  }, [product]);

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses');
      setWarehouses(response.data);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = ['name', 'sku', 'category', 'sellingPrice'];
      if (user?.role === 'admin') {
        requiredFields.push('costPrice');
      }
      
      for (const field of requiredFields) {
        if (!formData[field]) {
          throw new Error(`Please fill in all required fields`);
        }
      }

      if (parseFloat(formData.sellingPrice) <= 0) {
        throw new Error('Selling price must be greater than 0');
      }
      
      if (user?.role === 'admin' && formData.costPrice && parseFloat(formData.costPrice) <= 0) {
        throw new Error('Cost price must be greater than 0');
      }

      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateSKU = async () => {
    if (!formData.name.trim()) {
      setError('Please enter a product name first');
      return;
    }
    
    setGeneratingSKU(true);
    setError(null);
    
    try {
      const response = await api.post('/products/generate-sku', {
        productName: formData.name.trim()
      });
      
      setFormData({
        ...formData,
        sku: response.data.sku
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate SKU');
    } finally {
      setGeneratingSKU(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <Package className="h-8 w-8 mr-3 text-primary-600" />
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-3">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* SKU */}
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-3">
              SKU *
            </label>
            <div className="flex">
              <input
                type="text"
                id="sku"
                name="sku"
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter or generate SKU"
                value={formData.sku}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={generateSKU}
                disabled={generatingSKU}
                className="px-6 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {generatingSKU ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-3">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Spare Parts">Spare Parts</option>
              <option value="Tools">Tools</option>
              <option value="Materials">Materials</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Unit */}
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-3">
              Unit *
            </label>
            <select
              id="unit"
              name="unit"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={formData.unit}
              onChange={handleChange}
            >
              <option value="pcs">Pieces</option>
              <option value="kg">Kilogram</option>
              <option value="liters">Liters</option>
              <option value="meters">Meters</option>
              <option value="boxes">Boxes</option>
            </select>
          </div>

          {/* Cost Price - Admin Only */}
          {user?.role === 'admin' && (
            <div>
              <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-3">
                Cost Price (PKR) *
              </label>
              <input
                type="number"
                id="costPrice"
                name="costPrice"
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
                value={formData.costPrice}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Selling Price */}
          <div>
            <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-3">
              Selling Price (PKR) *
            </label>
            <input
              type="number"
              id="sellingPrice"
              name="sellingPrice"
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0.00"
              value={formData.sellingPrice}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-3">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter product description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>


        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {product ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductFormPage;
