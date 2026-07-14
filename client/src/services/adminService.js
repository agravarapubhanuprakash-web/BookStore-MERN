import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const exportBooksCSV = async () => {
  const response = await api.get('/admin/export-books', {
    responseType: 'blob',
  });
  return response.data;
};

export const importBooksCSV = async (formData) => {
  const response = await api.post('/admin/import-books', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getActivityLog = async () => {
  const response = await api.get('/admin/activity-log');
  return response.data;
};

export const getAllAnnouncements = async () => {
  const response = await api.get('/announcements');
  return response.data;
};

export const createAnnouncement = async (announcementData) => {
  const response = await api.post('/announcements', announcementData);
  return response.data;
};

export const updateAnnouncement = async (id, announcementData) => {
  const response = await api.put(`/announcements/${id}`, announcementData);
  return response.data;
};

export const deleteAnnouncement = async (id) => {
  const response = await api.delete(`/announcements/${id}`);
  return response.data;
};

export const getAllUsers = async (page = 1, query = '') => {
  const response = await api.get('/admin/users', {
    params: { page, q: query },
  });
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.put(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const toggleUserBlock = async (id) => {
  const response = await api.put(`/admin/users/${id}/block`);
  return response.data;
};
