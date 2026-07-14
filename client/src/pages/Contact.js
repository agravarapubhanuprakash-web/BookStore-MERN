import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    toast.success('Your message has been sent successfully! Our team will get back to you shortly.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="fade-in">
      <Container>
        <h2 className="section-title mb-4">Contact Us</h2>

        <Row className="gy-4 mb-5">
          {/* Contact Details */}
          <Col lg={5}>
            <h4 className="fw-bold mb-3 text-dark">Get in Touch</h4>
            <p className="text-secondary small mb-4">
              Have questions about your order, eBook downloads, or bulk textbook purchases for your college? Leave us a message or contact us directly.
            </p>

            <div className="d-flex flex-column gap-3 mb-4">
              <div className="d-flex align-items-start">
                <div className="p-3 bg-white border rounded shadow-sm text-primary me-3">
                  <FaPhone />
                </div>
                <div>
                  <h6 className="mb-0 fw-semibold">Phone Number</h6>
                  <p className="text-muted small mb-0">+91 98765 43210</p>
                </div>
              </div>

              <div className="d-flex align-items-start">
                <div className="p-3 bg-white border rounded shadow-sm text-primary me-3">
                  <FaEnvelope />
                </div>
                <div>
                  <h6 className="mb-0 fw-semibold">Email Support</h6>
                  <p className="text-muted small mb-0">support@bookstore.com</p>
                </div>
              </div>

              <div className="d-flex align-items-start">
                <div className="p-3 bg-white border rounded shadow-sm text-primary me-3">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h6 className="mb-0 fw-semibold">Address</h6>
                  <p className="text-muted small mb-0">B.Tech Campus Hostel, Sector 62, Noida, UP, India</p>
                </div>
              </div>

              <div className="d-flex align-items-start">
                <div className="p-3 bg-white border rounded shadow-sm text-primary me-3">
                  <FaClock />
                </div>
                <div>
                  <h6 className="mb-0 fw-semibold">Working Hours</h6>
                  <p className="text-muted small mb-0">Mon - Sat: 9:00 AM to 6:00 PM</p>
                </div>
              </div>
            </div>
          </Col>

          {/* Contact Form */}
          <Col lg={7}>
            <Card className="border shadow-sm p-4 bg-white">
              <Card.Body className="p-0">
                <h4 className="fw-bold mb-3">Send a Message</h4>
                <Form onSubmit={handleSubmit}>
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">Your Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="johndoe@email.com"
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">Subject</Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Inquiry about engineering textbooks"
                      className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-secondary">Your Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Write your comments here..."
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary" className="py-2 px-4 w-100 w-md-auto">
                    Submit Message
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contact;
