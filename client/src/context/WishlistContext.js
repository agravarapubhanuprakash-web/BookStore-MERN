import React, { createContext, useState, useEffect, useContext } from 'react';
import * as wishlistService from '../services/wishlistService';
import { AuthContext } from './AuthContext';
import { CartContext } from './CartContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const { fetchCart } = useContext(CartContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      if (data.success && data.wishlist) {
        setWishlistItems(data.wishlist.books || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const handleAddToWishlist = async (bookId) => {
    if (!isAuthenticated) return { success: false, message: 'Please login to add items to wishlist' };
    try {
      const data = await wishlistService.addToWishlist(bookId);
      if (data.success && data.wishlist) {
        setWishlistItems(data.wishlist.books || []);
        return { success: true, message: 'Added to wishlist!' };
      }
      return { success: false, message: 'Failed to add to wishlist' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error adding to wishlist',
      };
    }
  };

  const handleRemoveFromWishlist = async (bookId) => {
    if (!isAuthenticated) return { success: false, message: 'Please login' };
    try {
      const data = await wishlistService.removeFromWishlist(bookId);
      if (data.success && data.wishlist) {
        setWishlistItems(data.wishlist.books || []);
        return { success: true, message: 'Removed from wishlist' };
      }
      return { success: false, message: 'Failed to remove from wishlist' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error removing from wishlist',
      };
    }
  };

  const handleMoveToCart = async (bookId) => {
    if (!isAuthenticated) return { success: false, message: 'Please login' };
    try {
      const data = await wishlistService.moveToCart(bookId);
      if (data.success) {
        // Refresh both cart and wishlist
        await fetchWishlist();
        await fetchCart();
        return { success: true, message: 'Moved to cart successfully!' };
      }
      return { success: false, message: 'Failed to move to cart' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error moving to cart',
      };
    }
  };

  const isInWishlist = (bookId) => {
    return wishlistItems.some((item) => {
      const id = typeof item === 'object' ? item._id : item;
      return id.toString() === bookId.toString();
    });
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        fetchWishlist,
        addToWishlist: handleAddToWishlist,
        removeFromWishlist: handleRemoveFromWishlist,
        moveToCart: handleMoveToCart,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
