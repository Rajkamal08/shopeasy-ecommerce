import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, loginUser, registerUser, logoutUser, toggleWishlist as toggleWishlistApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await getMe();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await loginUser({ email, password });
      setUser(data);
      toast.success('Login successful!');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await registerUser({ name, email, password });
      setUser(data);
      toast.success('Registration successful!');
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      toast.success('Logged out');
    } catch {
      toast.error('Logout failed');
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.error('Please login first');
      return;
    }
    try {
      const { data } = await toggleWishlistApi(productId);
      setUser(prev => ({ ...prev, wishlist: data }));
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return user?.wishlist?.some(id =>
      (typeof id === 'string' ? id : id._id) === productId
    ) || false;
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      checkAuth, toggleWishlist, isInWishlist, setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
