import api from './api';

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getAllOrders = async (page = 1) => {
  const response = await api.get('/orders/all/list', {
    params: { page },
  });
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const getInvoice = async (id) => {
  // Return response as arraybuffer to download binary PDF file
  const response = await api.get(`/orders/${id}/invoice`, {
    responseType: 'blob',
  });
  return response.data;
};
