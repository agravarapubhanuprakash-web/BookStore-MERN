import React from 'react';
import { Card } from 'react-bootstrap';
import StarRating from './StarRating';
import { formatDate } from '../utils/helpers';
import { FaTrash, FaEdit } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

const ReviewCard = ({ review, onEdit, onDelete }) => {
  const { user } = useAuth();

  const isOwner = user && review.user && (review.user._id === user._id || review.user === user._id);
  const isAdmin = user && user.role === 'admin';

  // Extract review user details
  const reviewUser = review.user || {};
  const userName = reviewUser.name || 'Anonymous User';
  const profileImage = reviewUser.profileImage || 'https://res.cloudinary.com/demo/image/upload/v1570975200/sample.jpg';

  return (
    <Card className="border-0 shadow-sm mb-3">
      <Card.Body className="p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center">
            <img
              src={profileImage}
              alt={userName}
              className="rounded-circle me-3 border"
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            />
            <div>
              <h6 className="mb-0 fw-semibold" style={{ fontSize: '0.95rem' }}>{userName}</h6>
              <div className="d-flex align-items-center gap-2">
                <StarRating rating={review.rating} size={13} />
                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons if the current user is the owner or an admin */}
          {(isOwner || isAdmin) && (
            <div className="d-flex gap-2">
              {isOwner && onEdit && (
                <button
                  onClick={() => onEdit(review)}
                  className="btn btn-link text-secondary p-1"
                  title="Edit Review"
                >
                  <FaEdit size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(review._id)}
                  className="btn btn-link text-danger p-1"
                  title="Delete Review"
                >
                  <FaTrash size={13} />
                </button>
              )}
            </div>
          )}
        </div>
        <p className="mb-0 text-secondary small" style={{ lineHeight: '1.5' }}>
          {review.comment}
        </p>
      </Card.Body>
    </Card>
  );
};

export default ReviewCard;
