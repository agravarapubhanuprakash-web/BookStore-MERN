import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaGoogle, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';

const Signup = () => {
  const { register, googleLogin, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      toast.success('Registration successful! Welcome to BookStore.');
      navigate('/');
    } else {
      toast.error(res.message || 'Registration failed.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const mockTokenId = 'mock_google_oauth_token_123456789';
    const res = await googleLogin(mockTokenId);
    setLoading(false);

    if (res.success) {
      toast.success('Signed up with Google successfully!');
      navigate('/');
    } else {
      toast.error(res.message || 'Google signup failed.');
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
                  <h3 className="fw-bold mt-2 text-dark">Create Account</h3>
                  <p className="text-muted small">Sign up to buy books, read reviews, and track progress</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">Full Name</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted small">
                        <FaUser />
                      </span>
                      <Form.Control
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="py-2 border-start-0"
                      />
                    </div>
                  </Form.Group>

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
                        placeholder="john@email.com"
                        className="py-2 border-start-0"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted small">
                        <FaLock />
                      </span>
                      <Form.Control
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
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
                        placeholder="Repeat your password"
                        className="py-2 border-start-0"
                      />
                    </div>
                  </Form.Group>

                  <Button type="submit" variant="primary" className="w-100 py-2 mb-3 fw-semibold" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </Form>

                <div className="position-relative text-center my-4">
                  <hr className="border-secondary-subtle" />
                  <span className="position-absolute translate-middle bg-white px-3 text-muted small" style={{ top: '50%', left: '50%' }}>
                    OR
                  </span>
                </div>

                <Button variant="outline-dark" className="w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-4" onClick={handleGoogleSignIn} disabled={loading}>
                  <FaGoogle className="text-danger" /> Sign Up with Google
                </Button>

                <div className="text-center small">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary fw-medium text-decoration-none">
                    Login
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

export default Signup;
