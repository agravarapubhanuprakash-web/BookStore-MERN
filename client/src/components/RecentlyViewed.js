import React, { useContext } from 'react';
import { Row, Col } from 'react-bootstrap';
import { BookContext } from '../context/BookContext';
import BookCard from './BookCard';

const RecentlyViewed = () => {
  const { recentlyViewed } = useContext(BookContext);

  if (!recentlyViewed || recentlyViewed.length === 0) return null;

  return (
    <div className="mb-5">
      <h3 className="section-title-center">Recently Viewed</h3>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {recentlyViewed.slice(0, 4).map((book) => (
          <Col key={book._id}>
            <BookCard book={book} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RecentlyViewed;
