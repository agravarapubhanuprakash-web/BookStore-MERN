import api from './api';

export const getAllBooks = async (page = 1, limit = 12, sort = '') => {
  const response = await api.get('/books', {
    params: { page, limit, sort },
  });
  return response.data;
};

export const getBookById = async (id) => {
  const response = await api.get(`/books/${id}`);
  return response.data;
};

export const searchBooks = async (query) => {
  const response = await api.get('/books/search', {
    params: { q: query },
  });
  return response.data;
};

export const getFeaturedBooks = async () => {
  const response = await api.get('/books/featured');
  return response.data;
};

export const getNewArrivals = async () => {
  const response = await api.get('/books/new-arrivals');
  return response.data;
};

export const getBestSellers = async () => {
  const response = await api.get('/books/best-sellers');
  return response.data;
};

export const getBooksByCategory = async (categoryId, page = 1) => {
  const response = await api.get(`/books/category/${categoryId}`, {
    params: { page },
  });
  return response.data;
};

export const getRecommendations = async () => {
  const response = await api.get('/books/recommendations');
  return response.data;
};

export const createBook = async (formData) => {
  const response = await api.post('/books', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateBook = async (id, formData) => {
  const response = await api.put(`/books/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteBook = async (id) => {
  const response = await api.delete(`/books/${id}`);
  return response.data;
};
