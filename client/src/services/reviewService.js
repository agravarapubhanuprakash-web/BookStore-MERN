import api from './api';

export const getBookReviews = async (bookId) => {
  const response = await api.get(`/reviews/book/${bookId}`);
  return response.data;
};

export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

export const updateReview = async (id, reviewData) => {
  const response = await api.put(`/reviews/${id}`, reviewData);
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};

export const getAllReviews = async (page = 1) => {
  const response = await api.get('/reviews', {
    params: { page },
  });
  return response.data;
};
