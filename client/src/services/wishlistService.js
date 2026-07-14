import api from './api';

export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

export const addToWishlist = async (bookId) => {
  const response = await api.post('/wishlist', { bookId });
  return response.data;
};

export const removeFromWishlist = async (bookId) => {
  const response = await api.delete(`/wishlist/${bookId}`);
  return response.data;
};

export const moveToCart = async (bookId) => {
  const response = await api.post('/wishlist/move-to-cart', { bookId });
  return response.data;
};
