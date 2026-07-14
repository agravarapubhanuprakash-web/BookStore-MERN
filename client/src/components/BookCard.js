import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import useWishlist from '../hooks/useWishlist';
import useCart from '../hooks/useCart';
import { formatPrice, calculateDiscount } from '../utils/helpers';
import { toast } from 'react-toastify';

const BookCard = ({ book }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isFavorite = isInWishlist(book._id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault(); // Prevent navigating if wrapped in a link
    e.stopPropagation();

    if (isFavorite) {
      const res = await removeFromWishlist(book._id);
      if (res.success) {
        toast.info(res.message);
      } else {
        toast.error(res.message);
      }
    } else {
      const res = await addToWishlist(book._id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    }
  };

  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (book.stock <= 0) {
      toast.warning('This book is currently out of stock. You can reserve it instead.');
      return;
    }

    const res = await addToCart(book._id, 1);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const discount = calculateDiscount(book.originalPrice, book.price);

  return (
    <Card className="book-card position-relative">
      {/* Wishlist Button Overlay */}
      <button
        onClick={handleWishlistToggle}
        className={`wishlist-btn-overlay ${isFavorite ? 'active' : ''}`}
        aria-label="Toggle Wishlist"
      >
        {isFavorite ? <FaHeart /> : <FaRegHeart />}
      </button>

      {/* Book Cover Image */}
      <Link to={`/books/${book._id}`}>
        <Card.Img
          variant="top"
          src={book.coverImage}
          alt={book.title}
          className="book-card-img"
        />
      </Link>

      <Card.Body className="book-card-body">
        {/* Category Name */}
        <div className="d-flex align-items-center justify-content-between mb-1">
          <span className="category-badge">
            {book.category?.name || 'General'}
          </span>
          {book.isEbook && (
            <Badge bg="info" className="text-dark fw-bold" style={{ fontSize: '0.65rem' }}>
              eBook
            </Badge>
          )}
        </div>

        {/* Title */}
        <Link to={`/books/${book._id}`} className="text-decoration-none text-dark">
          <h5 className="book-card-title">{book.title}</h5>
        </Link>

        {/* Author */}
        <p className="book-card-author mb-2">By {book.author}</p>

        {/* Rating */}
        <div className="d-flex align-items-center mb-3">
          <div className="d-flex text-warning me-2" style={{ fontSize: '0.85rem' }}>
            <FaStar className="me-1" />
            <span className="text-dark fw-semibold">{book.rating || '0.0'}</span>
          </div>
          <span className="text-muted small">({book.numReviews || 0})</span>
        </div>

        {/* Price & Cart Button at bottom */}
        <div className="mt-auto">
          <div className="d-flex align-items-baseline gap-2 mb-3">
            <span className="fs-5 fw-bold text-primary">
              {formatPrice(book.price)}
            </span>
            {book.originalPrice && book.originalPrice > book.price && (
              <>
                <span className="text-muted text-decoration-line-through small">
                  {formatPrice(book.originalPrice)}
                </span>
                <span className="text-success small fw-semibold">
                  ({discount}% OFF)
                </span>
              </>
            )}
          </div>

          <div className="d-grid gap-2">
            {book.stock > 0 ? (
              <Button
                variant="primary"
                onClick={handleAddToCartClick}
                className="d-flex align-items-center justify-content-center gap-2 py-2"
              >
                <FaShoppingCart size={14} /> Add to Cart
              </Button>
            ) : (
              <Button
                variant="outline-danger"
                disabled
                className="py-2 fw-medium"
              >
                Out of Stock
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookCard;
