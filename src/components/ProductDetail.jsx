import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  RotateCcw, 
  AlertTriangle,
  Calendar,
  MapPin,
  TrendingUp,
  Loader2,
  X
} from 'lucide-react';

const ProductDetail = ({ productId, onClose }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OK': return 'text-green-600 bg-green-100';
      case 'YELLOW': return 'text-yellow-600 bg-yellow-100';
      case 'RED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventIcon = (action) => {
    switch (action) {
      case 'product_created': return <Package className="h-4 w-4" />;
      case 'purchase_created': return <TrendingUp className="h-4 w-4" />;
      case 'stock_transferred': return <Truck className="h-4 w-4" />;
      case 'order_delivered': return <CheckCircle className="h-4 w-4" />;
      case 'order_returned': return <RotateCcw className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (action) => {
    switch (action) {
      case 'product_created': return 'bg-blue-100 text-blue-600';
      case 'purchase_created': return 'bg-green-100 text-green-600';
      case 'stock_transferred': return 'bg-purple-100 text-purple-600';
      case 'order_delivered': return 'bg-emerald-100 text-emerald-600';
      case 'order_returned': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading product details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-gray-600">SKU: {product.sku}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                <div className="space-y-2">
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
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Stock Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Stock:</span>
                    <span className="font-medium">{product.totalStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.stockStatus)}`}>
                      {product.stockStatus}
                    </span>
                  </div>
                  {product.alertMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                        <span className="text-red-800 text-sm">{product.alertMessage}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Warehouse Stock</h3>
                <div className="space-y-2">
                  {product.warehouseStock?.map((warehouse, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600 text-sm">{warehouse.name}</span>
                      </div>
                      <span className="font-medium">{warehouse.stock} units</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            {product.timeline && product.timeline.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Timeline</h3>
                <div className="space-y-4">
                  {product.timeline.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className={`p-2 rounded-full ${getEventColor(event.action)}`}>
                        {getEventIcon(event.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 capitalize">
                            {event.action.replace(/_/g, ' ')}
                          </h4>
                          <span className="text-sm text-gray-500" title={event.timestampISO}>
                            {event.timestampDisplay}
                          </span>
                        </div>
                        {event.actorId && (
                          <p className="text-sm text-gray-600 mt-1">
                            By: {event.actorId.firstName} {event.actorId.lastName}
                          </p>
                        )}
                        {event.metadata && (
                          <div className="mt-2 text-sm text-gray-600">
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <div key={key} className="flex">
                                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                <span className="ml-2">{value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
