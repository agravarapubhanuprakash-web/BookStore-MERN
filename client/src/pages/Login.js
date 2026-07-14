import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';

const Login = () => {
  const { login, googleLogin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  const from = location.state?.from?.pathname || '/';
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }

    // Check if session expired query is present
    if (location.search.includes('expired=true')) {
      toast.warning('Your session has expired. Please login again.');
    }
  }, [isAuthenticated, navigate, from, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast.success('Logged in successfully!');
      navigate(from, { replace: true });
    } else {
      toast.error(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    // Mocking Google OAuth token ID for college demo
    const mockTokenId = 'mock_google_oauth_token_123456789';
    const res = await googleLogin(mockTokenId);
    setLoading(false);

    if (res.success) {
      toast.success('Logged in with Google successfully!');
      navigate(from, { replace: true });
    } else {
      toast.error(res.message || 'Google Sign-In failed.');
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
                  <span style={{ fontSize: '3rem' }}>📚</span>
                  <h3 className="fw-bold mt-2 text-dark">Welcome Back</h3>
                  <p className="text-muted small">Login to access your profile, orders, and library</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
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
                        placeholder="user@bookstore.com"
                        className="py-2 border-start-0"
                        style={{ outline: 'none' }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <Form.Label className="small fw-semibold text-secondary mb-0">Password</Form.Label>
                      <Link to="/forgot-password" style={{ fontSize: '0.8rem' }} className="text-primary text-decoration-none">
                        Forgot Password?
                      </Link>
                    </div>
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

                  <Button type="submit" variant="primary" className="w-100 py-2 mb-3 fw-semibold" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </Form>

                <div className="position-relative text-center my-4">
                  <hr className="border-secondary-subtle" />
                  <span className="position-absolute translate-middle bg-white px-3 text-muted small" style={{ top: '50%', left: '50%' }}>
                    OR
                  </span>
                </div>

                <Button variant="outline-dark" className="w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-4" onClick={handleGoogleSignIn} disabled={loading}>
                  <FaGoogle className="text-danger" /> Sign In with Google
                </Button>

                <div className="text-center small">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary fw-medium text-decoration-none">
                    Sign Up
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

export default Login;
