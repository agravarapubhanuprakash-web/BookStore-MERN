import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

const HeroBanner = () => {
  return (
    <div className="hero-section mb-5">
      <Container>
        <Row className="align-items-center gy-4">
          <Col lg={7} className="text-center text-lg-start">
            <h1 className="hero-title mb-3">
              Discover Your Next Favorite Book
            </h1>
            <p className="lead text-muted mb-4" style={{ fontSize: '1.15rem' }}>
              Welcome to BookStore! Explore our extensive library of engineering, technology, academic textbooks, competitive exam guides, and best-selling fiction. Built by students, for students.
            </p>
            <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
              <Button as={Link} to="/books" size="lg" variant="primary" className="px-4 py-2 fs-6">
                Browse Collection
              </Button>
              <Button as={Link} to="/about" size="lg" variant="outline-primary" className="px-4 py-2 fs-6">
                Learn More
              </Button>
            </div>
          </Col>
          <Col lg={5} className="d-flex justify-content-center">
            {/* Minimal CSS/SVG illustration of books */}
            <div
              className="position-relative d-flex align-items-center justify-content-center"
              style={{
                width: '300px',
                height: '300px',
                background: 'rgba(37, 99, 235, 0.05)',
                borderRadius: '50%',
              }}
            >
              <span style={{ fontSize: '7.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}>
                📚
              </span>
              <div
                className="position-absolute"
                style={{ fontSize: '2.5rem', top: '15%', right: '15%', transform: 'rotate(15deg)' }}
              >
                🎓
              </div>
              <div
                className="position-absolute"
                style={{ fontSize: '2.5rem', bottom: '15%', left: '15%', transform: 'rotate(-15deg)' }}
              >
                📖
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HeroBanner;
