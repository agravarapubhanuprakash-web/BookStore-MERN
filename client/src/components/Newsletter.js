import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    
    toast.success('Thank you for subscribing to our newsletter! Stay tuned for updates.');
    setEmail('');
  };

  return (
    <div className="py-5 bg-white border-top border-bottom text-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <span style={{ fontSize: '2.5rem' }}>📧</span>
            <h3 className="fw-bold mt-2 text-dark">Subscribe to Our Newsletter</h3>
            <p className="text-muted small mb-4">
              Get weekly updates on new arrivals, academic discounts, upcoming publications, and exclusive book deals sent directly to your inbox.
            </p>
            <Form onSubmit={handleSubscribe} className="d-flex gap-2 justify-content-center">
              <Form.Control
                type="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 border rounded-pill shadow-sm"
                style={{ maxWidth: '350px' }}
              />
              <Button type="submit" variant="primary" className="rounded-pill px-4">
                Subscribe
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Newsletter;
