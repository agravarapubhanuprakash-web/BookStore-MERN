import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaHeart, FaShoppingCart, FaUser, FaSignOutAlt, FaBookOpen } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import useWishlist from '../hooks/useWishlist';

const CustomNavbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="custom-navbar shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <span className="me-2" style={{ fontSize: '1.5rem' }}>📚</span>
          <span className="font-weight-bold">BookStore</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={isActive('/')}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/books" active={isActive('/books')}>
              Books
            </Nav.Link>
            <Nav.Link as={Link} to="/categories" active={isActive('/categories')}>
              Categories
            </Nav.Link>
            <Nav.Link as={Link} to="/about" active={isActive('/about')}>
              About
            </Nav.Link>
            <Nav.Link as={Link} to="/contact" active={isActive('/contact')}>
              Contact
            </Nav.Link>
          </Nav>
          
          <Nav className="align-items-lg-center">
            {/* Wishlist Link with Badge */}
            <Nav.Link as={Link} to="/wishlist" className="position-relative me-3 text-dark">
              <FaHeart size={18} className="text-secondary" />
              {wishlistItems.length > 0 && (
                <Badge
                  pill
                  bg="danger"
                  className="position-absolute translate-middle-y start-75"
                  style={{ fontSize: '0.65rem' }}
                >
                  {wishlistItems.length}
                </Badge>
              )}
            </Nav.Link>

            {/* Cart Link with Badge */}
            <Nav.Link as={Link} to="/cart" className="position-relative me-4 text-dark">
              <FaShoppingCart size={18} className="text-secondary" />
              {cartCount > 0 && (
                <Badge
                  pill
                  bg="primary"
                  className="position-absolute translate-middle-y start-75"
                  style={{ fontSize: '0.65rem' }}
                >
                  {cartCount}
                </Badge>
              )}
            </Nav.Link>

            {/* User Authentication Menu */}
            {isAuthenticated ? (
              <NavDropdown
                title={
                  <span className="d-inline-flex align-items-center">
                    <img
                      src={user?.profileImage || 'https://res.cloudinary.com/demo/image/upload/v1570975200/sample.jpg'}
                      alt="Profile"
                      className="rounded-circle me-2"
                      style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                    />
                    <span className="d-none d-lg-inline text-dark">{user?.name?.split(' ')[0]}</span>
                  </span>
                }
                id="user-nav-dropdown"
                align="end"
              >
                {user?.role === 'admin' && (
                  <>
                    <NavDropdown.Item as={Link} to="/admin" className="fw-bold text-primary">
                      Admin Panel
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                  </>
                )}
                <NavDropdown.Item as={Link} to="/profile">
                  My Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/orders">
                  My Orders
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/wishlist">
                  Wishlist
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/reading-progress">
                  Reading Progress
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/reservations">
                  Reserved Books
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/downloads">
                  Downloads
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/settings">
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger d-flex align-items-center">
                  <FaSignOutAlt className="me-2" /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
                <Link to="/login" className="btn btn-link text-decoration-none text-dark fw-medium">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
