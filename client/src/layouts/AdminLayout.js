import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Navbar, Nav, Button } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import {
  FaChartBar,
  FaBook,
  FaTags,
  FaUsers,
  FaShoppingCart,
  FaStar,
  FaBookmark,
  FaBell,
  FaHistory,
  FaArrowLeft,
  FaSignOutAlt
} from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const sidebarLinks = [
    { path: '/admin', label: 'Dashboard', icon: FaChartBar },
    { path: '/admin/books', label: 'Manage Books', icon: FaBook },
    { path: '/admin/categories', label: 'Manage Categories', icon: FaTags },
    { path: '/admin/users', label: 'Manage Users', icon: FaUsers },
    { path: '/admin/orders', label: 'Manage Orders', icon: FaShoppingCart },
    { path: '/admin/reviews', label: 'Manage Reviews', icon: FaStar },
    { path: '/admin/reservations', label: 'Manage Reservations', icon: FaBookmark },
    { path: '/admin/announcements', label: 'Manage Announcements', icon: FaBell },
    { path: '/admin/activity-log', label: 'Activity Log', icon: FaHistory },
  ];

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Admin Top Header */}
      <Navbar bg="white" className="border-bottom px-3 py-2 sticky-top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <span className="me-2" style={{ fontSize: '1.4rem' }}>📚</span>
            <span className="fw-bold">BookStore <span className="text-primary small" style={{ fontSize: '0.8rem' }}>Admin</span></span>
          </Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text className="me-3 small d-none d-sm-inline">
              Logged in as: <strong className="text-dark">{user?.name}</strong>
            </Navbar.Text>
            <Button variant="outline-danger" size="sm" onClick={handleLogout} className="d-flex align-items-center gap-1">
              <FaSignOutAlt size={12} /> Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="flex-grow-1 p-0">
        <Row className="g-0">
          {/* Left Sidebar */}
          <Col lg={2} className="admin-sidebar shadow-sm">
            <Nav className="flex-column">
              <div className="px-4 py-2 text-muted fw-bold small text-uppercase mb-2">Operations</div>
              
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`admin-sidebar-link ${isActive(link.path) ? 'active' : ''}`}
                  >
                    <Icon /> {link.label}
                  </Link>
                );
              })}

              <div className="dropdown-divider my-3"></div>

              <Link to="/" className="admin-sidebar-link text-secondary">
                <FaArrowLeft /> Back to Website
              </Link>
            </Nav>
          </Col>

          {/* Right Main Content */}
          <Col lg={10} className="p-4" style={{ minHeight: 'calc(100vh - 60px)' }}>
            <div className="fade-in">
              <Outlet />
            </div>
          </Col>
        </Row>
      </Container>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default AdminLayout;
