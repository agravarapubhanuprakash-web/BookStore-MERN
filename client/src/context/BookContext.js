import React, { createContext, useState, useEffect } from 'react';

export const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse recently viewed books:', error.message);
      }
    }
  }, []);

  const addToRecentlyViewed = (book) => {
    if (!book || !book._id) return;
    
    setRecentlyViewed((prev) => {
      // Remove any existing copy of the book to avoid duplicates
      const filtered = prev.filter((item) => item._id !== book._id);
      // Prepend the new book to the list
      const updated = [book, ...filtered].slice(0, 10); // Keep max 10
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <BookContext.Provider
      value={{
        recentlyViewed,
        addToRecentlyViewed,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};
