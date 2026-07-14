import api from './api';

export const createRazorpayOrder = async (orderId) => {
  const response = await api.post('/payments/razorpay', { orderId });
  return response.data;
};

export const verifyPayment = async (paymentDetails) => {
  const response = await api.post('/payments/verify', paymentDetails);
  return response.data;
};
