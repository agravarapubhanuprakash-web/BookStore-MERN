import api from './api';

export const createReservation = async (bookId) => {
  const response = await api.post('/reservations', { bookId });
  return response.data;
};

export const getMyReservations = async () => {
  const response = await api.get('/reservations/my-reservations');
  return response.data;
};

export const cancelReservation = async (id) => {
  const response = await api.put(`/reservations/cancel/${id}`);
  return response.data;
};

export const getAllReservations = async (page = 1) => {
  const response = await api.get('/reservations/all/list', {
    params: { page },
  });
  return response.data;
};

export const notifyReservation = async (id) => {
  const response = await api.put(`/reservations/${id}/notify`);
  return response.data;
};
