import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import Loader, { SkeletonCard } from '../components/Loader';
import * as bookService from '../services/bookService';
import * as categoryService from '../services/categoryService';

const CategoryBooks = () => {
  const { id } = useParams();
  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        const catRes = await categoryService.getAllCategories();
        if (catRes.success) {
          const found = (catRes.categories || []).find((c) => c._id === id);
          setCategory(found);
        }
      } catch (error) {
        console.error('Error fetching category name:', error.message);
      }
    };

    fetchCategoryDetails();
  }, [id]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await bookService.getBooksByCategory(id, currentPage);
        if (res.success) {
          setBooks(res.books || []);
          setTotalPages(res.pages || 1);
        }
      } catch (error) {
        console.error('Error fetching books by category:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [id, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fade-in">
      <Container>
        <div className="d-flex align-items-baseline gap-2 mb-4">
          <Link to="/categories" className="text-decoration-none small text-primary">&larr; All Categories</Link>
        </div>

        <h2 className="section-title mb-2">
          {category ? `${category.name} Books` : 'Category Books'}
        </h2>
        {category?.description && (
          <p className="text-secondary small mb-4">{category.description}</p>
        )}

        {loading ? (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {[...Array(4)].map((_, i) => (
              <Col key={i}><SkeletonCard /></Col>
            ))}
          </Row>
        ) : books.length === 0 ? (
          <div className="text-center py-5">
            <span style={{ fontSize: '3rem' }}>📚</span>
            <h4 className="fw-bold mt-3 text-dark">No Books Found</h4>
            <p className="text-muted small">There are currently no books in this category.</p>
          </div>
        ) : (
          <>
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {books.map((book) => (
                <Col key={book._id}>
                  <BookCard book={book} />
                </Col>
              ))}
            </Row>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </Container>
    </div>
  );
};

export default CategoryBooks;
