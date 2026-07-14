import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Breadcrumb, Tabs, Tab } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaShoppingCart, FaBookmark, FaDownload, FaStar } from 'react-icons/fa';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import Loader from '../components/Loader';
import BookCard from '../components/BookCard';
import { BookContext } from '../context/BookContext';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import useWishlist from '../hooks/useWishlist';
import { formatPrice, calculateDiscount, formatDate } from '../utils/helpers';
import * as bookService from '../services/bookService';
import * as reviewService from '../services/reviewService';
import * as reservationService from '../services/reservationService';
import { toast } from 'react-toastify';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToRecentlyViewed } = useContext(BookContext);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);

  const fetchBookDetails = async () => {
    try {
      const bookRes = await bookService.getBookById(id);
      if (bookRes.success && bookRes.book) {
        setBook(bookRes.book);
        addToRecentlyViewed(bookRes.book);

        // Fetch related books in same category
        if (bookRes.book.category) {
          const catId = bookRes.book.category._id || bookRes.book.category;
          const relatedRes = await bookService.getBooksByCategory(catId, 1);
          if (relatedRes.success) {
            // Filter out current book
            const filtered = (relatedRes.books || []).filter(
              (b) => b._id !== bookRes.book._id
            );
            setRelatedBooks(filtered.slice(0, 4));
          }
        }

        // Fetch reviews
        const reviewsRes = await reviewService.getBookReviews(id);
        if (reviewsRes.success) {
          setReviews(reviewsRes.reviews || []);
        }
      }
    } catch (error) {
      console.error('Error fetching book details:', error.message);
      toast.error('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBookDetails();
  }, [id]);

  const handleWishlistToggle = async () => {
    const isFav = isInWishlist(book._id);
    if (isFav) {
      const res = await removeFromWishlist(book._id);
      if (res.success) toast.info(res.message);
      else toast.error(res.message);
    } else {
      const res = await addToWishlist(book._id);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    }
  };

  const handleAddToCartClick = async () => {
    if (book.stock <= 0) {
      toast.warning('This book is out of stock.');
      return;
    }
    const res = await addToCart(book._id, 1);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
  };

  const handleBuyNow = async () => {
    if (book.stock <= 0) {
      toast.warning('This book is out of stock.');
      return;
    }
    const res = await addToCart(book._id, 1);
    if (res.success) {
      navigate('/cart');
    } else {
      toast.error(res.message);
    }
  };

  const handleReserve = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to reserve books');
      navigate('/login');
      return;
    }
    try {
      const res = await reservationService.createReservation(book._id);
      if (res.success) {
        toast.success(res.message || 'Book reserved successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reserve book');
    }
  };

  const handleDownloadSample = () => {
    if (!book.ebookUrl) {
      toast.warning('No digital copy available for this book');
      return;
    }
    window.open(book.ebookUrl, '_blank');
  };

  const handleReviewSubmit = async (reviewData) => {
    if (!isAuthenticated) {
      toast.info('Please login to write a review');
      navigate('/login');
      return;
    }

    try {
      let res;
      if (editingReview) {
        res = await reviewService.updateReview(editingReview._id, reviewData);
        if (res.success) {
          toast.success('Review updated successfully!');
          setEditingReview(null);
        }
      } else {
        res = await reviewService.createReview({ book: book._id, ...reviewData });
        if (res.success) {
          toast.success('Review submitted successfully!');
        }
      }
      fetchBookDetails(); // Reload data to recalculate score
    } catch (error) {
      toast.error(error.response?.data?.message || 'Review submission failed');
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const res = await reviewService.deleteReview(reviewId);
        if (res.success) {
          toast.success('Review deleted');
          fetchBookDetails();
        }
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  if (loading) return <Loader message="Loading book details..." />;
  if (!book) return <div className="text-center py-5"><h4>Book Not Found</h4></div>;

  const isFavorite = isInWishlist(book._id);
  const discount = calculateDiscount(book.originalPrice, book.price);

  return (
    <div className="fade-in">
      <Container>
        {/* Breadcrumbs */}
        <Breadcrumb className="small mb-4 bg-transparent p-0">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/books' }}>Books</Breadcrumb.Item>
          <Breadcrumb.Item active>{book.title}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Core details row */}
        <Row className="gy-4 mb-5">
          {/* Cover image column */}
          <Col md={5} lg={4} className="d-flex justify-content-center">
            <div className="position-relative w-100" style={{ maxWidth: '320px' }}>
              <img
                src={book.coverImage}
                alt={book.title}
                className="img-fluid rounded border shadow-md w-100"
                style={{ minHeight: '400px', objectFit: 'cover' }}
              />
              {discount > 0 && (
                <Badge
                  bg="success"
                  className="position-absolute top-0 start-0 m-3 px-3 py-2 fw-bold"
                  style={{ borderRadius: '50px', fontSize: '0.8rem' }}
                >
                  {discount}% OFF
                </Badge>
              )}
            </div>
          </Col>

          {/* Info & Actions column */}
          <Col md={7} lg={8}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="category-badge m-0">
                {book.category?.name || 'General'}
              </span>
              {book.isEbook && <Badge bg="info" className="text-dark">eBook Available</Badge>}
            </div>

            <h1 className="fw-bold mb-2 text-dark" style={{ fontSize: '2rem' }}>{book.title}</h1>
            <p className="lead text-secondary mb-3" style={{ fontSize: '1.1rem' }}>By <strong className="text-dark">{book.author}</strong></p>

            {/* Rating overview */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <StarRating rating={book.rating} size={18} />
              <span className="text-dark fw-semibold small mt-1">{book.rating || '0.0'} out of 5 stars</span>
              <span className="text-muted small mt-1">({book.numReviews || 0} reviews)</span>
            </div>

            {/* Pricing Section */}
            <div className="bg-light p-3 rounded mb-4 d-flex align-items-center gap-3">
              <span className="fs-3 fw-bold text-primary">{formatPrice(book.price)}</span>
              {book.originalPrice && book.originalPrice > book.price && (
                <>
                  <span className="text-muted text-decoration-line-through fs-5">{formatPrice(book.originalPrice)}</span>
                  <Badge bg="success" className="px-2 py-1">Save {formatPrice(book.originalPrice - book.price)}</Badge>
                </>
              )}
            </div>

            {/* Availability */}
            <div className="mb-4 small">
              <span className="text-muted me-2">Availability:</span>
              {book.stock > 0 ? (
                <span className="text-success fw-bold">In Stock ({book.stock} copies available)</span>
              ) : (
                <span className="text-danger fw-bold">Out of Stock</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap gap-3 mb-4">
              {book.stock > 0 ? (
                <>
                  <Button variant="primary" size="lg" className="d-flex align-items-center gap-2 px-4 py-2 fs-6" onClick={handleAddToCartClick}>
                    <FaShoppingCart size={16} /> Add to Cart
                  </Button>
                  <Button variant="outline-primary" size="lg" className="px-4 py-2 fs-6" onClick={handleBuyNow}>
                    Buy Now
                  </Button>
                </>
              ) : (
                <Button variant="warning" size="lg" className="d-flex align-items-center gap-2 px-4 py-2 fs-6 text-dark" onClick={handleReserve}>
                  <FaBookmark size={14} /> Reserve Book
                </Button>
              )}

              <Button
                variant={isFavorite ? 'danger' : 'outline-secondary'}
                size="lg"
                className="px-4 py-2 fs-6 d-flex align-items-center gap-2"
                onClick={handleWishlistToggle}
              >
                <FaHeart /> {isFavorite ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>

              {book.isEbook && book.ebookUrl && (
                <Button variant="outline-info" size="lg" className="px-4 py-2 fs-6 d-flex align-items-center gap-2 text-dark" onClick={handleDownloadSample}>
                  <FaDownload size={13} /> Sample PDF
                </Button>
              )}
            </div>

            {/* Meta facts table */}
            <Row className="g-3 small border-top pt-4">
              <Col sm={6}>
                <div className="text-muted">Publisher:</div>
                <div className="fw-medium text-dark">{book.publisher || 'N/A'}</div>
              </Col>
              <Col sm={6}>
                <div className="text-muted">Language:</div>
                <div className="fw-medium text-dark">{book.language}</div>
              </Col>
              <Col sm={6}>
                <div className="text-muted">ISBN:</div>
                <div className="fw-medium text-dark">{book.isbn || 'N/A'}</div>
              </Col>
              <Col sm={6}>
                <div className="text-muted">Pages:</div>
                <div className="fw-medium text-dark">{book.pageCount || 'N/A'} pages</div>
              </Col>
              <Col sm={6}>
                <div className="text-muted">Published On:</div>
                <div className="fw-medium text-dark">{formatDate(book.publicationDate)}</div>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Description & Reviews Tabs */}
        <div className="mb-5 border rounded bg-white shadow-sm overflow-hidden">
          <Tabs defaultActiveKey="description" id="book-details-tabs" className="bg-light border-bottom">
            <Tab eventKey="description" title="Description" className="p-4">
              <h5 className="fw-bold mb-3">Book Description</h5>
              <p className="text-secondary" style={{ lineHeight: '1.7', whiteSpace: 'pre-line' }}>{book.description}</p>
            </Tab>
            <Tab eventKey="reviews" title={`Reviews (${reviews.length})`} className="p-4">
              <Row className="gy-4">
                <Col lg={5}>
                  {/* Write a review form */}
                  <ReviewForm
                    onSubmit={handleReviewSubmit}
                    initialValues={editingReview}
                    onCancel={editingReview ? () => setEditingReview(null) : null}
                  />
                </Col>
                <Col lg={7}>
                  <h5 className="fw-bold mb-3">Customer Reviews</h5>
                  {reviews.length === 0 ? (
                    <p className="text-muted small">No reviews yet. Be the first to review this book!</p>
                  ) : (
                    reviews.map((r) => (
                      <ReviewCard
                        key={r._id}
                        review={r}
                        onEdit={setEditingReview}
                        onDelete={handleReviewDelete}
                      />
                    ))
                  )}
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </div>

        {/* Related books list */}
        {relatedBooks.length > 0 && (
          <div className="mb-5">
            <h3 className="section-title-center">Related Books</h3>
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {relatedBooks.map((b) => (
                <Col key={b._id}>
                  <BookCard book={b} />
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BookDetails;
