import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, Save, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SalesFormPage = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    },
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    expectedDeliveryDate: '',
    notes: '',
    items: []
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [stockChecks, setStockChecks] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('customerInfo.')) {
      const field = name.replace('customerInfo.', '');
      if (field.startsWith('address.')) {
        const addressField = field.replace('address.', '');
        setFormData(prev => ({
          ...prev,
          customerInfo: {
            ...prev.customerInfo,
            address: {
              ...prev.customerInfo.address,
              [addressField]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          customerInfo: {
            ...prev.customerInfo,
            [field]: value
          }
        }));
      }
    } else if (name.startsWith('deliveryAddress.')) {
      const field = name.replace('deliveryAddress.', '');
      setFormData(prev => ({
        ...prev,
        deliveryAddress: {
          ...prev.deliveryAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear validation error
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: '',
        variantId: '',
        quantity: 1,
        unitPrice: 0
      }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const getVariantPrice = (variantId, productId) => {
    const product = products.find(p => p._id === productId);
    if (!product || !product.variants) return 0;
    
    const variant = product.variants.find(v => (v._id || v.sku) === variantId);
    return variant ? (variant.sellingPrice || 0) : 0;
  };

  const getProductVariants = (productId) => {
    const product = products.find(p => p._id === productId);
    return (product && product.hasVariants && product.variants) ? product.variants : [];
  };

  const updateItem = async (index, field, value) => {
    const updatedItems = formData.items.map((item, i) => 
      i === index 
        ? { 
            ...item, 
            [field]: value,
            // Reset variant and price when product changes
            ...(field === 'productId' ? {
              variantId: '',
              unitPrice: 0
            } : {}),
            // Update unit price when variant is selected
            ...(field === 'variantId' ? {
              unitPrice: getVariantPrice(value, item.productId)
            } : {}),
            ...(field === 'quantity' || field === 'unitPrice' ? {
              totalPrice: field === 'quantity' ? value * item.unitPrice : item.quantity * value
            } : {})
          }
        : item
    );

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));

    // Check stock availability when product or quantity changes
    if ((field === 'productId' || field === 'quantity') && value) {
      await checkStockAvailability(updatedItems[index]);
    }
  };

  const checkStockAvailability = async (item) => {
    if (!item.productId || !item.quantity) return;

    try {
      const response = await api.get('/stock/levels', {
        params: { productId: item.productId }
      });
      
      const stockData = response.data;
      const totalAvailableStock = stockData.reduce((sum, warehouse) => {
        const productStock = warehouse.products.find(p => p.productId === item.productId);
        return sum + (productStock ? productStock.availableStock : 0);
      }, 0);

      setStockChecks(prev => ({
        ...prev,
        [item.productId]: {
          available: totalAvailableStock,
          required: item.quantity,
          sufficient: totalAvailableStock >= item.quantity
        }
      }));
    } catch (error) {
      console.error('Error checking stock:', error);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Customer info validation
    if (!formData.customerInfo.name) {
      errors['customerInfo.name'] = 'Customer name is required';
    }
    if (!formData.customerInfo.email) {
      errors['customerInfo.email'] = 'Customer email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerInfo.email)) {
      errors['customerInfo.email'] = 'Customer email is invalid';
    }
    if (!formData.customerInfo.phone) {
      errors['customerInfo.phone'] = 'Customer phone is required';
    }

    // Delivery address validation
    if (!formData.deliveryAddress.street) {
      errors['deliveryAddress.street'] = 'Delivery address is required';
    }
    if (!formData.deliveryAddress.city) {
      errors['deliveryAddress.city'] = 'Delivery city is required';
    }

    // Items validation
    if (formData.items.length === 0) {
      errors.items = 'At least one item is required';
    }

    formData.items.forEach((item, index) => {
      if (!item.productId) {
        errors[`item_${index}_productId`] = 'Product is required';
      }
      
      // Check if product has variants
      const product = products.find(p => p._id === item.productId);
      if (product && product.hasVariants && product.variants && product.variants.length > 0) {
        if (!item.variantId) {
          errors[`item_${index}_variantId`] = 'Variant is required for this product';
        }
      }
      
      if (!item.quantity || item.quantity <= 0) {
        errors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        errors[`item_${index}_unitPrice`] = 'Unit price must be greater than 0';
      }

      // Check stock availability
      const stockCheck = stockChecks[item.productId];
      if (stockCheck && !stockCheck.sufficient) {
        errors[`item_${index}_stock`] = `Insufficient stock. Available: ${stockCheck.available}, Required: ${stockCheck.required}`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/sales', formData);
      const newSale = response.data.salesOrder;
      
      // Show success message with more details
      toast.success(`Sales order ${newSale.orderNumber || 'SO-' + newSale._id.slice(-4)} created successfully!`, {
        duration: 4000,
        icon: '✅'
      });
      
      // Store the new sale in localStorage for immediate access
      const existingSales = JSON.parse(localStorage.getItem('tempSales') || '[]');
      existingSales.unshift(newSale);
      localStorage.setItem('tempSales', JSON.stringify(existingSales));
      
      // If onSuccess callback is provided, use it for immediate state update
      if (onSuccess) {
        onSuccess(newSale);
      } else {
        // Navigate back to sales page
        navigate('/sales');
      }
    } catch (error) {
      console.error('Error creating sales order:', error);
      toast.error(error.response?.data?.error || 'Failed to create sales order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/sales')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Sales</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Sales Order</h1>
              <p className="text-gray-600">Create new sales order for customer</p>
            </div>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Customer Information */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customerInfo.name"
                  value={formData.customerInfo.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors['customerInfo.name'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter customer name"
                />
                {validationErrors['customerInfo.name'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['customerInfo.name']}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="customerInfo.email"
                  value={formData.customerInfo.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors['customerInfo.email'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="customer@example.com"
                />
                {validationErrors['customerInfo.email'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['customerInfo.email']}
                  </p>
                )}
      </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="customerInfo.phone"
                  value={formData.customerInfo.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors['customerInfo.phone'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {validationErrors['customerInfo.phone'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['customerInfo.phone']}
                  </p>
                )}
              </div>

          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  name="expectedDeliveryDate"
                  value={formData.expectedDeliveryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="deliveryAddress.street"
                  value={formData.deliveryAddress.street}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors['deliveryAddress.street'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Main Street"
                />
                {validationErrors['deliveryAddress.street'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['deliveryAddress.street']}
                  </p>
                )}
      </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="deliveryAddress.city"
                  value={formData.deliveryAddress.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors['deliveryAddress.city'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="New York"
                />
                {validationErrors['deliveryAddress.city'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors['deliveryAddress.city']}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="deliveryAddress.state"
                  value={formData.deliveryAddress.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="deliveryAddress.zipCode"
                  value={formData.deliveryAddress.zipCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="10001"
                />
              </div>

          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="deliveryAddress.country"
                  value={formData.deliveryAddress.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="United States"
                />
              </div>
          </div>
        </div>

          {/* Sales Items */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            {validationErrors.items && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {validationErrors.items}
                </p>
              </div>
            )}

            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No items added yet. Click "Add Item" to get started.</p>
              </div>
            ) : (
        <div className="space-y-4">
          {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Item {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product *
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            validationErrors[`item_${index}_productId`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name} ({product.sku})
                            </option>
                          ))}
                        </select>
                        {validationErrors[`item_${index}_productId`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {validationErrors[`item_${index}_productId`]}
                          </p>
                        )}
                      </div>

                      {/* Variant Selection */}
                      {item.productId && getProductVariants(item.productId).length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Variant *
                          </label>
                          <select
                            value={item.variantId || ''}
                            onChange={(e) => updateItem(index, 'variantId', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                              validationErrors[`item_${index}_variantId`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select Variant</option>
                            {getProductVariants(item.productId).map(variant => (
                              <option key={variant._id || variant.sku} value={variant._id || variant.sku}>
                                {variant.name} - PKR {variant.sellingPrice}
                              </option>
                            ))}
                          </select>
                          {validationErrors[`item_${index}_variantId`] && (
                            <p className="mt-1 text-sm text-red-600">
                              {validationErrors[`item_${index}_variantId`]}
                            </p>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            validationErrors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {validationErrors[`item_${index}_quantity`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {validationErrors[`item_${index}_quantity`]}
                          </p>
                        )}
                        {stockChecks[item.productId] && (
                          <div className="mt-1">
                            {stockChecks[item.productId].sufficient ? (
                              <p className="text-sm text-green-600 flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Stock available: {stockChecks[item.productId].available}
                              </p>
                            ) : (
                              <p className="text-sm text-red-600 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Low stock: {stockChecks[item.productId].available} available
                              </p>
                )}
              </div>
                        )}
            </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit Price *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            validationErrors[`item_${index}_unitPrice`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {validationErrors[`item_${index}_unitPrice`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {validationErrors[`item_${index}_unitPrice`]}
                          </p>
                        )}
        </div>

        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Price
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Additional notes for this order..."
              />
        </div>

            {/* Total */}
            {formData.items.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount:</p>
                    <p className="text-2xl font-bold text-primary-600">
                      ${calculateTotal().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/sales')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Sales Order</span>
                </>
              )}
          </button>
        </div>
        </motion.form>
      </div>
    </div>
  );
};

export default SalesFormPage;
