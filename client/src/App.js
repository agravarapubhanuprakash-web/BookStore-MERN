import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Categories from './pages/Categories';
import CategoryBooks from './pages/CategoryBooks';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// User Protected Pages
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Reservations from './pages/Reservations';
import ReadingProgress from './pages/ReadingProgress';
import Downloads from './pages/Downloads';
import Settings from './pages/Settings';

// Admin Protected Pages
import Dashboard from './pages/admin/Dashboard';
import ManageBooks from './pages/admin/ManageBooks';
import AddEditBook from './pages/admin/AddEditBook';
import ManageCategories from './pages/admin/ManageCategories';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrders from './pages/admin/ManageOrders';
import ManageReviews from './pages/admin/ManageReviews';
import ManageReservations from './pages/admin/ManageReservations';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import ActivityLog from './pages/admin/ActivityLog';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Website Flow (Navbar + Footer) */}
        <Route path="/" element={<MainLayout />}>
          {/* Public Routes */}
          <Route index element={<Home />} />
          <Route path="books" element={<Books />} />
          <Route path="books/:id" element={<BookDetails />} />
          <Route path="categories" element={<Categories />} />
          <Route path="categories/:id" element={<CategoryBooks />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />

          {/* User Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<Profile />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="reading-progress" element={<ReadingProgress />} />
            <Route path="downloads" element={<Downloads />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Admin Dashboard Flow (Sidebar Layout) */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="books" element={<ManageBooks />} />
            <Route path="books/add" element={<AddEditBook />} />
            <Route path="books/edit/:id" element={<AddEditBook />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="reviews" element={<ManageReviews />} />
            <Route path="reservations" element={<ManageReservations />} />
            <Route path="announcements" element={<ManageAnnouncements />} />
            <Route path="activity-log" element={<ActivityLog />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
