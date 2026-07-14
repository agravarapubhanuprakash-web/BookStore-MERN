import React from 'react';
import { Spinner, Card } from 'react-bootstrap';

// Standard loading spinner
export const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '200px' }}>
      <Spinner animation="border" variant="primary" role="status" className="mb-2">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <span className="text-secondary small fw-medium">{message}</span>
    </div>
  );
};

// Skeleton loader that mirrors the BookCard design
export const SkeletonCard = () => {
  return (
    <Card className="book-card border shadow-sm h-100" style={{ pointerEvents: 'none' }}>
      {/* Cover Image Placeholder */}
      <div className="skeleton skeleton-image w-100" style={{ height: '280px' }}></div>
      
      <Card.Body className="book-card-body p-3">
        {/* Category Badge Placeholder */}
        <div className="skeleton skeleton-text w-25 mb-3" style={{ height: '18px', borderRadius: '50px' }}></div>
        
        {/* Title Placeholders */}
        <div className="skeleton skeleton-text w-100 mb-2" style={{ height: '16px' }}></div>
        <div className="skeleton skeleton-text w-75 mb-3" style={{ height: '16px' }}></div>
        
        {/* Author Placeholder */}
        <div className="skeleton skeleton-text w-50 mb-3" style={{ height: '12px' }}></div>
        
        {/* Star Rating Placeholder */}
        <div className="skeleton skeleton-text w-40 mb-4" style={{ height: '14px' }}></div>
        
        {/* Price & Button Placeholders */}
        <div className="mt-auto">
          <div className="skeleton skeleton-text w-30 mb-3" style={{ height: '20px' }}></div>
          <div className="skeleton skeleton-text w-100" style={{ height: '36px', borderRadius: '8px' }}></div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Loader;
