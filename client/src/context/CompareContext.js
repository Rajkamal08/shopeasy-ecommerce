import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext();
export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = useCallback((product) => {
    setCompareList(prev => {
      if (prev.find(p => p._id === product._id)) {
        toast.error('Already in comparison');
        return prev;
      }
      if (prev.length >= 3) {
        toast.error('Max 3 products for comparison');
        return prev;
      }
      toast.success(`Added "${product.title?.substring(0, 25)}..." to compare`);
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId) => {
    setCompareList(prev => prev.filter(p => p._id !== productId));
  }, []);

  const isInCompare = useCallback((productId) => {
    return compareList.some(p => p._id === productId);
  }, [compareList]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};
