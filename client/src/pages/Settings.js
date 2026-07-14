import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { FaCog, FaBell, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';

const Settings = () => {
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState({
    orderEmails: true,
    promoEmails: false,
    reservationSMS: true,
  });

  const handleToggle = (e) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Your settings preferences have been saved.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('WARNING: Are you sure you want to permanently delete your BookStore account? This action cannot be undone.')) {
      toast.error('Account deletion is disabled for demo student accounts.');
    }
  };

  return (
    <div className="fade-in">
      <Container style={{ maxWidth: '750px' }}>
        <h2 className="section-title mb-4">Account Settings</h2>
        
        <Form onSubmit={handleSave}>
          {/* Notification settings */}
          <Card className="border shadow-sm bg-white p-4 mb-4">
            <Card.Body className="p-0">
              <h5 className="fw-bold mb-3 text-dark d-flex align-items-center">
                <FaBell className="text-primary me-2" /> Notification Preferences
              </h5>
              <p className="text-secondary small mb-4">Choose how you want to be notified about your account activities.</p>

              <Form.Check
                type="switch"
                id="order-emails"
                name="orderEmails"
                checked={notifications.orderEmails}
                onChange={handleToggle}
                label={
                  <div className="ms-2">
                    <div className="fw-semibold small">Order Confirmation Emails</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Receive receipts and tracking codes instantly after placing orders.</div>
                  </div>
                }
                className="mb-3 d-flex align-items-start"
              />

              <Form.Check
                type="switch"
                id="promo-emails"
                name="promoEmails"
                checked={notifications.promoEmails}
                onChange={handleToggle}
                label={
                  <div className="ms-2">
                    <div className="fw-semibold small">Newsletter & Recommendations</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Receive curated lists of recommended textbooks and seasonal discounts.</div>
                  </div>
                }
                className="mb-3 d-flex align-items-start"
              />

              <Form.Check
                type="switch"
                id="reservation-sms"
                name="reservationSMS"
                checked={notifications.reservationSMS}
                onChange={handleToggle}
                label={
                  <div className="ms-2">
                    <div className="fw-semibold small">Out-of-Stock Reservation Alerts</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Get instant alerts as soon as your reserved books are replenished.</div>
                  </div>
                }
                className="mb-0 d-flex align-items-start"
              />
            </Card.Body>
          </Card>

          {/* Privacy & Danger settings */}
          <Card className="border shadow-sm bg-white p-4 mb-4">
            <Card.Body className="p-0">
              <h5 className="fw-bold mb-3 text-dark d-flex align-items-center">
                <FaShieldAlt className="text-danger me-2" /> Security & Danger Zone
              </h5>
              <p className="text-secondary small mb-4">Manage advanced security actions for your student login profile.</p>

              <div className="d-flex justify-content-between align-items-center p-3 border rounded bg-light">
                <div>
                  <h6 className="fw-semibold mb-1 text-dark small">Delete Account</h6>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>Permanently erase your orders, wishlist, and progress.</p>
                </div>
                <Button variant="danger" size="sm" className="fw-semibold" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Button type="submit" variant="primary" className="fw-semibold px-4 py-2">
            Save Preferences
          </Button>
        </Form>
      </Container>
    </div>
  );
};

export default Settings;
