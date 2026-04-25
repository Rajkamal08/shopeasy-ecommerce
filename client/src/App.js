import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import CompareBar from './components/CompareBar/CompareBar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout/AdminLayout';
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import OrderSuccess from './pages/OrderSuccess/OrderSuccess';
import Orders from './pages/Orders/Orders';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import Compare from './pages/Compare/Compare';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminUsers from './pages/Admin/AdminUsers';
import NotFound from './pages/NotFound/NotFound';

// Layout wrapper that hides Navbar/Footer on admin pages
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <Navbar />
      {isAdmin ? children : (
        <>
          <main>{children}</main>
          <Footer />
        </>
      )}
      <CompareBar />
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <CompareProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  fontFamily: 'var(--font)',
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  padding: '12px 16px',
                },
                success: { iconTheme: { primary: '#26a541', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ff6161', secondary: '#fff' } },
              }}
            />
            <AppLayout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/compare" element={<Compare />} />

                {/* Protected User Routes */}
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Admin Routes — Separate Layout */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </CompareProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
