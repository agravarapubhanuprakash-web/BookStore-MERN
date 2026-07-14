import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from './Loader';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying admin credentials..." />;
  }

  return isAuthenticated && isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};

export default AdminRoute;
