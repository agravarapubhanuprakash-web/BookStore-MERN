import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';

const useWishlist = () => {
  return useContext(WishlistContext);
};

export default useWishlist;
