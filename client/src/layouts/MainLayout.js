import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from '../components/Navbar';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-grow-1 py-4">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default MainLayout;
