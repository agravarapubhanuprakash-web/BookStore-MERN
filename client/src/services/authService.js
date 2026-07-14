import api from './api';

export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const googleLogin = async (tokenId) => {
  const response = await api.post('/auth/google', { tokenId });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.put(`/auth/reset-password/${token}`, { password });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/auth/profile', userData);
  return response.data;
};

export const changePassword = async (oldPassword, newPassword) => {
  const response = await api.put('/auth/change-password', { oldPassword, newPassword });
  return response.data;
};

export const uploadProfileImage = async (formData) => {
  const response = await api.put('/auth/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
