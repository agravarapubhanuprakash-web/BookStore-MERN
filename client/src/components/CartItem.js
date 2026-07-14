import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { formatPrice } from '../utils/helpers';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { book, quantity } = item;

  if (!book) return null;

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(book._id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < book.stock) {
      onUpdateQuantity(book._id, quantity + 1);
    }
  };

  return (
    <div className="border-bottom py-3">
      <Row className="align-items-center gy-3">
        {/* Book Cover Image */}
        <Col xs={3} md={2}>
          <Link to={`/books/${book._id}`}>
            <img
              src={book.coverImage}
              alt={book.title}
              className="img-fluid rounded border shadow-sm"
              style={{ maxHeight: '90px', objectFit: 'cover' }}
            />
          </Link>
        </Col>

        {/* Book Title & Author */}
        <Col xs={9} md={4}>
          <Link to={`/books/${book._id}`} className="text-decoration-none text-dark">
            <h6 className="mb-1 text-truncate fw-semibold">{book.title}</h6>
          </Link>
          <p className="text-muted small mb-1">By {book.author}</p>
          <p className="text-primary fw-medium small mb-0">{formatPrice(book.price)}</p>
        </Col>

        {/* Quantity Controller */}
        <Col xs={6} md={3} className="d-flex align-items-center">
          <div className="input-group border rounded" style={{ maxWidth: '120px' }}>
            <Button
              variant="light"
              size="sm"
              onClick={handleDecrease}
              disabled={quantity <= 1}
              className="border-0 px-2 d-flex align-items-center justify-content-center"
            >
              <FaMinus size={10} />
            </Button>
            <Form.Control
              type="text"
              readOnly
              value={quantity}
              className="border-0 text-center bg-white p-0 fw-semibold"
              style={{ fontSize: '0.85rem' }}
            />
            <Button
              variant="light"
              size="sm"
              onClick={handleIncrease}
              disabled={quantity >= book.stock}
              className="border-0 px-2 d-flex align-items-center justify-content-center"
            >
              <FaPlus size={10} />
            </Button>
          </div>
          {book.stock <= 5 && book.stock > 0 && (
            <span className="text-danger small ms-2" style={{ fontSize: '0.7rem' }}>
              Only {book.stock} left
            </span>
          )}
        </Col>

        {/* Item Subtotal & Delete Button */}
        <Col xs={6} md={3} className="d-flex align-items-center justify-content-between justify-content-md-end gap-4">
          <span className="fw-bold text-dark">
            {formatPrice(book.price * quantity)}
          </span>
          <Button
            variant="link"
            className="text-danger p-0 border-0"
            onClick={() => onRemove(book._id)}
            title="Remove item"
          >
            <FaTrash size={14} />
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default CartItem;
