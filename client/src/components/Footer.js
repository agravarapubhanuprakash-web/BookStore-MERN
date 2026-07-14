import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer mt-auto">
      <Container>
        <Row className="gy-4">
          <Col lg={4} md={6}>
            <h5 className="text-white mb-3 d-flex align-items-center">
              <span className="me-2">📚</span>BookStore
            </h5>
            <p className="text-muted small">
              A modern online bookstore for students and book lovers. Explore thousands of books across technology, competitive exams, engineering, and popular fiction. Built as a MERN mini project.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted fs-5"><FaGithub /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted fs-5"><FaLinkedin /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted fs-5"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-muted fs-5"><FaInstagram /></a>
            </div>
          </Col>
          
          <Col lg={2} md={6}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/books" className="footer-link">Books</Link></li>
              <li><Link to="/categories" className="footer-link">Categories</Link></li>
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
            </ul>
          </Col>
          
          <Col lg={2} md={6}>
            <h5>Account</h5>
            <ul className="list-unstyled">
              <li><Link to="/profile" className="footer-link">My Account</Link></li>
              <li><Link to="/orders" className="footer-link">My Orders</Link></li>
              <li><Link to="/wishlist" className="footer-link">Wishlist</Link></li>
              <li><Link to="/cart" className="footer-link">Shopping Cart</Link></li>
              <li><Link to="/settings" className="footer-link">Settings</Link></li>
            </ul>
          </Col>
          
          <Col lg={4} md={6}>
            <h5>Contact Info</h5>
            <ul className="list-unstyled text-muted small">
              <li className="d-flex align-items-center mb-2">
                <FaMapMarkerAlt className="me-2 text-primary" />
                <span>B.Tech Campus Hostel, Sector 62, Noida, UP, India</span>
              </li>
              <li className="d-flex align-items-center mb-2">
                <FaPhone className="me-2 text-primary" />
                <span>+91 98765 43210</span>
              </li>
              <li className="d-flex align-items-center mb-2">
                <FaEnvelope className="me-2 text-primary" />
                <span>support@bookstore.com</span>
              </li>
            </ul>
          </Col>
        </Row>
        <hr className="border-secondary my-4" />
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0 small text-muted">
              &copy; {new Date().getFullYear()} BookStore. All rights reserved. Created for college submission.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end mt-2 mt-md-0">
            <p className="mb-0 small text-muted">
              Developed by B.Tech 2nd Year Student
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
