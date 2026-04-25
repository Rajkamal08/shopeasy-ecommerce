import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as addToCartApi, updateCartItem as updateCartItemApi, removeFromCart as removeFromCartApi, applyCoupon as applyCouponApi, clearCart as clearCartApi } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart(null); return; }
    try {
      setCartLoading(true);
      const { data } = await getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return false;
    }
    try {
      const { data } = await addToCartApi({ productId, quantity });
      setCart(data);
      toast.success('Added to cart!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  };

  const updateItem = async (productId, quantity) => {
    try {
      const { data } = await updateCartItemApi({ productId, quantity });
      setCart(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    }
  };

  const removeItem = async (productId) => {
    try {
      const { data } = await removeFromCartApi(productId);
      setCart(data);
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const applyCouponCode = async (couponCode) => {
    try {
      const { data } = await applyCouponApi({ couponCode });
      setCart(data);
      toast.success(`Coupon "${couponCode}" applied!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon');
    }
  };

  const emptyCart = async () => {
    try {
      await clearCartApi();
      setCart(prev => prev ? { ...prev, items: [], totalPrice: 0, couponCode: '', discount: 0 } : null);
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart, cartLoading, cartCount, addItem, updateItem, removeItem,
      applyCouponCode, emptyCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
