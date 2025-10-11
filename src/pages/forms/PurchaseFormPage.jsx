import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Plus, Minus, Trash2, Save, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PurchaseFormPage = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDeliveryDate: '',
    notes: '',
    paymentMethod: 'cash',
    taxAmount: 0,
    discountAmount: 0,
    items: []
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data.suppliers || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to fetch suppliers');
    }
  };

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index 
          ? { 
              ...item, 
              [field]: value,
              ...(field === 'quantity' || field === 'unitPrice' ? {
                totalPrice: field === 'quantity' ? value * item.unitPrice : item.quantity * value
              } : {})
            }
          : item
      )
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.supplierId) {
      errors.supplierId = 'Supplier is required';
    }

    if (formData.items.length === 0) {
      errors.items = 'At least one item is required';
    }

    formData.items.forEach((item, index) => {
      if (!item.productId) {
        errors[`item_${index}_productId`] = 'Product is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        errors[`item_${index}_unitPrice`] = 'Unit price must be greater than 0';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const calculateFinalAmount = () => {
    const subtotal = calculateTotal();
    const tax = parseFloat(formData.taxAmount) || 0;
    const discount = parseFloat(formData.discountAmount) || 0;
    return subtotal + tax - discount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);
    try {
      const purchaseData = {
        ...formData,
        totalAmount: calculateTotal(),
        finalAmount: calculateFinalAmount()
      };
      const response = await api.post('/purchases', purchaseData);
      const newPurchase = response.data.purchase;
      
      // Show success message with more details
      toast.success(`Purchase order ${newPurchase.purchaseNumber} created successfully!`, {
        duration: 4000,
        icon: '✅'
      });
      
      // Store the new purchase in localStorage for immediate access
      const existingPurchases = JSON.parse(localStorage.getItem('tempPurchases') || '[]');
      existingPurchases.unshift(newPurchase);
      localStorage.setItem('tempPurchases', JSON.stringify(existingPurchases));
      
      // If onSuccess callback is provided, use it for immediate state update
      if (onSuccess) {
        onSuccess(newPurchase);
      } else {
        // Navigate back to purchases page
        navigate('/purchases');
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast.error(error.response?.data?.error || 'Failed to create purchase order');
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
              onClick={() => navigate('/purchases')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Purchases</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Purchase Order</h1>
              <p className="text-gray-600">Add new purchase from supplier</p>
            </div>
          </div>
      </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Supplier Information */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier *
                </label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors.supplierId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name} ({supplier.supplierCode})
                    </option>
              ))}
            </select>
                {validationErrors.supplierId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.supplierId}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="credit_card">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Amount (PKR)
                </label>
                <input
                  type="number"
                  name="taxAmount"
                  value={formData.taxAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Amount (PKR)
                </label>
                <input
                  type="number"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Additional notes for this purchase..."
                />
              </div>
          </div>
        </div>

          {/* Purchase Items */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Purchase Items</h2>
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
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
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

            {/* Total */}
            {formData.items.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="text-right space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">PKR {calculateTotal().toFixed(2)}</span>
                    </div>
                    
                    {parseFloat(formData.taxAmount) > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium text-green-600">+PKR {parseFloat(formData.taxAmount).toFixed(2)}</span>
                      </div>
                    )}
                    
                    {parseFloat(formData.discountAmount) > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-red-600">-PKR {parseFloat(formData.discountAmount).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-300 pt-2">
                      <p className="text-lg font-bold text-primary-600">
                        Final Amount: PKR {calculateFinalAmount().toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/purchases')}
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
                  <span>Create Purchase Order</span>
                </>
              )}
          </button>
        </div>
        </motion.form>
      </div>
    </div>
  );
};

export default PurchaseFormPage;
