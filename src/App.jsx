import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout, ProtectedRoute, Dashboard, LoginForm } from './modules';
import RoleBasedRoute from './components/RoleBasedRoute';
import Login from './pages/Login';
import RegisterForm from './modules/auth/components/RegisterForm';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import PurchaseFormPage from './pages/forms/PurchaseFormPage';
import SalesFormPage from './pages/forms/SalesFormPage';
import SupplierFormPage from './pages/forms/SupplierFormPage';
import SupplierDetailPage from './pages/SupplierDetailPage';
import UserFormPage from './pages/forms/UserFormPage';

// Advanced Components
import AdvancedAdminDashboard from './components/dashboards/AdvancedAdminDashboard';
import AdvancedUserManagement from './pages/AdvancedUserManagement';
import AdvancedReports from './pages/AdvancedReports';
import Suppliers from './pages/Suppliers';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/" replace /> : <RegisterForm />} 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        } 
      >
        {/* Advanced Dashboard for Admin */}
        <Route 
          index 
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdvancedAdminDashboard />
            </RoleBasedRoute>
          } 
        />
        
        {/* Regular Dashboard for other roles */}
        <Route 
          path="dashboard" 
          element={<Dashboard />} 
        />
        
        {/* Core Modules */}
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<Products />} />
        <Route path="products/:id/edit" element={<Products />} />
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="warehouses/new" element={<Warehouses />} />
        <Route path="sales" element={<Sales />} />
        <Route path="sales/new" element={<Sales />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="purchases/new" element={<Purchases />} />
        
        {/* Reports */}
        <Route path="reports" element={<Reports />} />
        <Route path="reports/advanced" element={<AdvancedReports />} />
        
        {/* User Management */}
        <Route 
          path="users" 
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdvancedUserManagement />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="users/new" 
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <UserFormPage />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="users/edit/:id" 
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <UserFormPage />
            </RoleBasedRoute>
          } 
        />
        
        {/* Advanced User Management */}
        <Route 
          path="users/advanced" 
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdvancedUserManagement />
            </RoleBasedRoute>
          } 
        />
        
        {/* Suppliers */}
        <Route 
          path="suppliers" 
          element={
            <RoleBasedRoute allowedRoles={['admin', 'manager']}>
              <Suppliers />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="suppliers/:id" 
          element={
            <RoleBasedRoute allowedRoles={['admin', 'manager']}>
              <SupplierDetailPage />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="suppliers/add" 
          element={
            <RoleBasedRoute allowedRoles={['admin', 'manager']}>
              <SupplierFormPage />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="suppliers/edit/:id" 
          element={
            <RoleBasedRoute allowedRoles={['admin', 'manager']}>
              <SupplierFormPage />
            </RoleBasedRoute>
          } 
        />
        
        {/* Settings */}
        <Route 
          path="settings" 
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <Settings />
            </RoleBasedRoute>
          } 
        />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
