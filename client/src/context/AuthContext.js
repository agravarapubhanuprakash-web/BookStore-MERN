import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Optionally fetch latest profile in the background
        try {
          const profileData = await authService.getProfile();
          if (profileData.success && profileData.user) {
            setUser(profileData.user);
            localStorage.setItem('user', JSON.stringify(profileData.user));
          }
        } catch (error) {
          console.error('Failed to refresh user profile:', error.message);
          // Token might be invalid, logout
          if (error.response && error.response.status === 401) {
            handleLogout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      if (data.success && data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password);
      if (data.success && data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (tokenId) => {
    setLoading(true);
    try {
      const data = await authService.googleLogin(tokenId);
      if (data.success && data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: 'Google authentication failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google Login failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleUpdateProfile = async (userData) => {
    try {
      const data = await authService.updateProfile(userData);
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed.',
      };
    }
  };

  const handleUpdateProfileImage = async (formData) => {
    try {
      const data = await authService.uploadProfileImage(formData);
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: 'Failed to upload image' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Image upload failed.',
      };
    }
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login: handleLogin,
        register: handleRegister,
        googleLogin: handleGoogleLogin,
        logout: handleLogout,
        updateProfile: handleUpdateProfile,
        updateProfileImage: handleUpdateProfileImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
