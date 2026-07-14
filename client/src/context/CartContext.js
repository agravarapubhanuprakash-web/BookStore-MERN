import React, { createContext, useState, useEffect, useContext } from 'react';
import * as cartService from '../services/cartService';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await cartService.getCart();
      if (data.success && data.cart) {
        setCartItems(data.cart.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const handleAddToCart = async (bookId, quantity = 1) => {
    if (!isAuthenticated) return { success: false, message: 'Please login to add items to cart' };
    try {
      const data = await cartService.addToCart(bookId, quantity);
      if (data.success && data.cart) {
        setCartItems(data.cart.items || []);
        return { success: true, message: 'Added to cart successfully!' };
      }
      return { success: false, message: 'Failed to add item to cart' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error adding item to cart',
      };
    }
  };

  const handleUpdateQuantity = async (bookId, quantity) => {
    if (!isAuthenticated) return;
    try {
      const data = await cartService.updateCartItem(bookId, quantity);
      if (data.success && data.cart) {
        setCartItems(data.cart.items || []);
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error.message);
    }
  };

  const handleRemoveItem = async (bookId) => {
    if (!isAuthenticated) return;
    try {
      const data = await cartService.removeFromCart(bookId);
      if (data.success && data.cart) {
        setCartItems(data.cart.items || []);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error.message);
    }
  };

  const handleClearCart = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await cartService.clearCart();
      if (data.success && data.cart) {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error.message);
    }
  };

  // Derived states
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => {
    const price = item.book?.price || 0;
    return acc + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        fetchCart,
        addToCart: handleAddToCart,
        updateQuantity: handleUpdateQuantity,
        removeItem: handleRemoveItem,
        clearCart: handleClearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
