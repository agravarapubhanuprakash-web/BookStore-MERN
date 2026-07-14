import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const About = () => {
  return (
    <div className="fade-in">
      <Container>
        <h2 className="section-title mb-4">About BookStore</h2>
        
        <Row className="gy-4 mb-5">
          <Col lg={7}>
            <h4 className="fw-bold mb-3 text-dark">Our Mission & Purpose</h4>
            <p className="text-secondary" style={{ lineHeight: '1.7' }}>
              Welcome to BookStore, your premier destination for educational resources, fiction, and specialized academic materials. This platform was developed as a comprehensive <strong>MERN Stack Mini Project</strong> for B.Tech CSE coursework. 
            </p>
            <p className="text-secondary" style={{ lineHeight: '1.7' }}>
              Our goal was to design and build an online bookstore inspired by modern minimal aesthetics. We focused on delivering a clean user experience using Bootstrap 5, complete database integrations with MongoDB and Mongoose, payment pathways in Razorpay, secure authentication via JWT tokens, and Cloudinary media management.
            </p>
            <p className="text-secondary" style={{ lineHeight: '1.7' }}>
              Whether you are an engineering student preparing for university exams, an aspirant practicing for UPSC or GATE, or a reader looking for self-help and fiction, BookStore provides a seamless experience for purchasing physical books and instantly downloading eBooks.
            </p>
          </Col>
          <Col lg={5} className="d-flex align-items-center justify-content-center">
            <Card className="border shadow-sm p-4 bg-white" style={{ maxWidth: '400px' }}>
              <Card.Body className="text-center p-0">
                <span style={{ fontSize: '4rem' }}>🎓</span>
                <h5 className="fw-bold mt-3 mb-1 text-dark">Academic Project</h5>
                <p className="text-muted small mb-3">B.Tech 2nd Year Mini Project</p>
                <div className="text-start bg-light p-3 rounded small text-secondary">
                  <div className="mb-2"><strong>Course:</strong> Full-Stack Development</div>
                  <div className="mb-2"><strong>Frontend:</strong> React.js, Bootstrap 5</div>
                  <div className="mb-2"><strong>Backend:</strong> Node.js, Express.js</div>
                  <div className="mb-0"><strong>Database:</strong> MongoDB & Mongoose</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <h4 className="fw-bold mb-4 text-center">Core Platform Features</h4>
        <Row xs={1} md={3} className="g-4 mb-5">
          <Col>
            <Card className="border shadow-sm h-100 p-3">
              <Card.Body>
                <h5 className="fw-semibold mb-2 text-primary">🔐 Secure Authentication</h5>
                <p className="text-secondary small mb-0">Email/Password signups, hashed credentials, secure JWT session management, and integrated Google OAuth login options.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="border shadow-sm h-100 p-3">
              <Card.Body>
                <h5 className="fw-semibold mb-2 text-primary">💳 Integrated Payments</h5>
                <p className="text-secondary small mb-0">Seamless checkout pathways using Razorpay Test Mode gateway for credit/debit card processing, alongside Cash on Delivery.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="border shadow-sm h-100 p-3">
              <Card.Body>
                <h5 className="fw-semibold mb-2 text-primary">📖 eBook Integration</h5>
                <p className="text-secondary small mb-0">Instant eBook sample previews, full PDF download modules, and reading progress bookmarks stored per user account.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="border shadow-sm h-100 p-3">
              <Card.Body>
                <h5 className="fw-semibold mb-2 text-primary">📊 Admin Operations</h5>
                <p className="text-secondary small mb-0">Dashboard analytics including revenue totals, stock indicators, user control systems, review deletion, and CSV import/export.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="border shadow-sm h-100 p-3">
              <Card.Body>
                <h5 className="fw-semibold mb-2 text-primary">⭐ Ratings & Reviews</h5>
                <p className="text-secondary small mb-0">Dynamic rating systems where authenticated users can review books and write descriptions to help the student community.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="border shadow-sm h-100 p-3">
              <Card.Body>
                <h5 className="fw-semibold mb-2 text-primary">📌 Book Reservations</h5>
                <p className="text-secondary small mb-0">Automatic reservation listings that let students hold out-of-stock items and receive automated email alerts on stock updates.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default About;
