import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import * as authService from '../services/authService';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      if (res.success) {
        toast.success(res.message || 'Password reset link sent to your email.');
        setEmail('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in py-5" style={{ background: 'var(--bg-light)', minHeight: 'calc(100vh - 200px)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={5}>
            <Card className="border shadow-lg rounded-3 bg-white p-4">
              <Card.Body className="p-0">
                <div className="text-center mb-4">
                  <span style={{ fontSize: '3rem' }}>🔒</span>
                  <h3 className="fw-bold mt-2 text-dark">Forgot Password</h3>
                  <p className="text-muted small">Enter your email and we'll send you a password reset link</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-secondary">Email Address</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted small">
                        <FaEnvelope />
                      </span>
                      <Form.Control
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@email.com"
                        className="py-2 border-start-0"
                      />
                    </div>
                  </Form.Group>

                  <Button type="submit" variant="primary" className="w-100 py-2 mb-4 fw-semibold" disabled={loading}>
                    {loading ? 'Sending link...' : 'Send Reset Link'}
                  </Button>
                </Form>

                <div className="text-center">
                  <Link to="/login" className="text-secondary small text-decoration-none d-inline-flex align-items-center gap-2">
                    <FaArrowLeft size={10} /> Back to Login
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;
