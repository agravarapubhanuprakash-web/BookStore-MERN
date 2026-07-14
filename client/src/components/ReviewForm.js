import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import StarRating from './StarRating';

const ReviewForm = ({ onSubmit, initialValues, onCancel }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (initialValues) {
      setRating(initialValues.rating || 5);
      setComment(initialValues.comment || '');
    }
  }, [initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    onSubmit({ rating, comment });
    // Reset if creating new
    if (!initialValues) {
      setRating(5);
      setComment('');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="bg-light p-4 rounded border mb-4">
      <h5 className="mb-3 fw-bold">{initialValues ? 'Edit Your Review' : 'Write a Review'}</h5>
      
      <Form.Group className="mb-3">
        <Form.Label className="d-block mb-1 fw-semibold text-secondary small">Your Rating</Form.Label>
        <StarRating rating={rating} onChange={setRating} readOnly={false} size={24} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold text-secondary small">Your Comments</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Share your thoughts about this book..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          style={{ fontSize: '0.9rem' }}
        />
      </Form.Group>

      <div className="d-flex gap-2">
        <Button type="submit" variant="primary" size="sm" className="px-3">
          {initialValues ? 'Update Review' : 'Submit Review'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline-secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </Form>
  );
};

export default ReviewForm;
