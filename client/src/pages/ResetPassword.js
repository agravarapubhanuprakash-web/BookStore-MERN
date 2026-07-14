import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import * as authService from '../services/authService';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(token, password);
      if (res.success) {
        toast.success('Password reset successful! You can now login.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password.');
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
                  <span style={{ fontSize: '3rem' }}>🔑</span>
                  <h3 className="fw-bold mt-2 text-dark">Reset Password</h3>
                  <p className="text-muted small">Choose a strong password containing at least 6 characters</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">New Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted small">
                        <FaLock />
                      </span>
                      <Form.Control
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="py-2 border-start-0"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-secondary">Confirm Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted small">
                        <FaLock />
                      </span>
                      <Form.Control
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="py-2 border-start-0"
                      />
                    </div>
                  </Form.Group>

                  <Button type="submit" variant="primary" className="w-100 py-2 mb-4 fw-semibold" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
