import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import BookCard from './BookCard';
import { SkeletonCard } from './Loader';
import { getRecommendations } from '../services/bookService';
import useAuth from '../hooks/useAuth';

const RecommendedBooks = () => {
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const data = await getRecommendations();
        if (data.success && data.books) {
          setBooks(data.books);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  if (loading) {
    return (
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {[...Array(4)].map((_, i) => (
          <Col key={i}><SkeletonCard /></Col>
        ))}
      </Row>
    );
  }

  if (books.length === 0) return null;

  return (
    <div className="mb-5">
      <h3 className="section-title-center">Recommended For You</h3>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {books.slice(0, 4).map((book) => (
          <Col key={book._id}>
            <BookCard book={book} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RecommendedBooks;
