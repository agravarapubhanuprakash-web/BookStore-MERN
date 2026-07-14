import React from 'react';
import { Card } from 'react-bootstrap';
import { FaQuoteLeft } from 'react-icons/fa';
import StarRating from './StarRating';

const TestimonialCard = ({ name, role, avatar, comment, rating = 5 }) => {
  return (
    <Card className="testimonial-card border shadow-sm h-100">
      <Card.Body className="d-flex flex-column">
        <div className="text-primary mb-3">
          <FaQuoteLeft size={24} style={{ opacity: 0.2 }} />
        </div>
        <p className="text-secondary small flex-grow-1" style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
          "{comment}"
        </p>
        <div className="d-flex align-items-center mt-3 pt-3 border-top">
          <img
            src={avatar || 'https://res.cloudinary.com/demo/image/upload/v1570975200/sample.jpg'}
            alt={name}
            className="rounded-circle me-3 border"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          />
          <div>
            <h6 className="mb-0 fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{name}</h6>
            <span className="text-muted small d-block mb-1" style={{ fontSize: '0.75rem' }}>{role}</span>
            <StarRating rating={rating} size={11} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TestimonialCard;
