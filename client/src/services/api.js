import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth ──
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const logoutUser = () => API.post('/auth/logout');
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const addAddress = (data) => API.post('/auth/address', data);
export const deleteAddress = (id) => API.delete(`/auth/address/${id}`);
export const toggleWishlist = (productId) => API.post(`/auth/wishlist/${productId}`);

// ── Products ──
export const getProducts = (params) => API.get('/products', { params });
export const getProductById = (id) => API.get(`/products/${id}`);
export const getFeaturedProducts = () => API.get('/products/featured');
export const getSuggestions = (q) => API.get('/products/suggestions', { params: { q } });
export const addReview = (id, data) => API.post(`/products/${id}/review`, data);
export const getBrands = () => API.get('/products/brands');
export const getTopRated = (category) => API.get('/products/top-rated', { params: { category } });
export const getNewArrivals = () => API.get('/products/new-arrivals');
export const compareProductsAPI = (ids) => API.get('/products/compare', { params: { ids } });

// ── Cart ──
export const getCart = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart/add', data);
export const updateCartItem = (data) => API.put('/cart/update', data);
export const removeFromCart = (productId) => API.delete(`/cart/remove/${productId}`);
export const getAvailableCoupons = () => API.get('/cart/coupons');
export const applyCoupon = (data) => API.post('/cart/coupon', data);
export const clearCart = () => API.delete('/cart/clear');

// ── Orders ──
export const placeOrder = (data) => API.post('/orders/place', data);
export const getMyOrders = () => API.get('/orders/my-orders');
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);
export const getAdminOrders = () => API.get('/orders/admin/all');
export const updateOrderStatus = (id, data) => API.put(`/orders/admin/${id}/status`, data);
export const getAdminStats = () => API.get('/orders/admin/stats');

// ── Payment ──
export const createPaymentOrder = (data) => API.post('/payment/create-order', data);
export const verifyPayment = (data) => API.post('/payment/verify', data);

export default API;
