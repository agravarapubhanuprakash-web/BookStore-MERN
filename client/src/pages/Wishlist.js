import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaHeart, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useWishlist from '../hooks/useWishlist';
import Loader from '../components/Loader';
import { formatPrice } from '../utils/helpers';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const { wishlistItems, loading, removeFromWishlist, moveToCart } = useWishlist();

  const handleRemove = async (bookId) => {
    const res = await removeFromWishlist(bookId);
    if (res.success) {
      toast.info(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleMoveToCart = async (bookId) => {
    const res = await moveToCart(bookId);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  if (loading) return <Loader message="Loading your wishlist..." />;

  return (
    <div className="fade-in">
      <Container>
        <h2 className="section-title mb-4">My Wishlist</h2>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-5 bg-white border rounded shadow-sm">
            <span style={{ fontSize: '4rem', color: 'var(--border)' }}><FaHeart /></span>
            <h4 className="fw-bold mt-3 text-dark">Your Wishlist is Empty</h4>
            <p className="text-muted small mb-4">Save your favorite books here to buy them later.</p>
            <Link to="/books" className="btn btn-primary px-4 py-2">
              Explore Books
            </Link>
          </div>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {wishlistItems.map((book) => (
              <Col key={book._id}>
                <Card className="book-card h-100 position-relative">
                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => handleRemove(book._id)}
                    className="wishlist-btn-overlay active"
                    style={{ color: '#ef4444' }}
                    title="Remove from Wishlist"
                  >
                    <FaTrash size={12} />
                  </button>

                  <Link to={`/books/${book._id}`}>
                    <Card.Img
                      variant="top"
                      src={book.coverImage}
                      alt={book.title}
                      className="book-card-img"
                    />
                  </Link>

                  <Card.Body className="book-card-body">
                    <Link to={`/books/${book._id}`} className="text-decoration-none text-dark">
                      <h5 className="book-card-title">{book.title}</h5>
                    </Link>
                    <p className="book-card-author mb-2">By {book.author}</p>
                    
                    <div className="mt-auto">
                      <div className="fw-bold text-primary mb-3">
                        {formatPrice(book.price)}
                      </div>

                      <div className="d-grid gap-2">
                        {book.stock > 0 ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="d-flex align-items-center justify-content-center gap-2 py-2"
                            onClick={() => handleMoveToCart(book._id)}
                          >
                            <FaShoppingCart size={13} /> Move to Cart
                          </Button>
                        ) : (
                          <Button variant="outline-danger" disabled size="sm" className="py-2">
                            Out of Stock
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Wishlist;
