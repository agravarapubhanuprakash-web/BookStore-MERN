import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import { SkeletonCard } from '../components/Loader';
import * as bookService from '../services/bookService';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('');

  const fetchBooksData = async () => {
    setLoading(true);
    try {
      let data;
      if (searchQuery) {
        // Simple search query matching
        const res = await bookService.searchBooks(searchQuery);
        if (res.success) {
          // If searching, we mock local sorting and pagination since backend search is simple
          let results = res.books || [];
          
          // Sort results
          if (sortOption === 'price_asc') {
            results.sort((a, b) => a.price - b.price);
          } else if (sortOption === 'price_desc') {
            results.sort((a, b) => b.price - a.price);
          } else if (sortOption === 'rating') {
            results.sort((a, b) => b.rating - a.rating);
          } else if (sortOption === 'title') {
            results.sort((a, b) => a.title.localeCompare(b.title));
          } else {
            results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          }

          // Paginate (12 per page)
          const limit = 12;
          const totalItems = results.length;
          const pages = Math.ceil(totalItems / limit);
          setTotalPages(pages || 1);
          
          const startIndex = (currentPage - 1) * limit;
          const paginatedResults = results.slice(startIndex, startIndex + limit);
          setBooks(paginatedResults);
        }
      } else {
        const res = await bookService.getAllBooks(currentPage, 12, sortOption);
        if (res.success) {
          setBooks(res.books || []);
          setTotalPages(res.pages || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching books:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksData();
  }, [currentPage, searchQuery, sortOption]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset page on new search
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset page on new sort
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fade-in">
      <Container>
        <h2 className="section-title mb-4">Our Book Collection</h2>
        
        {/* Search and Sort Toolbar */}
        <Row className="align-items-center mb-4 gy-3">
          <Col md={8}>
            <SearchBar onSearch={handleSearch} />
          </Col>
          <Col md={4} className="d-flex justify-content-md-end align-items-center">
            <Form.Group className="d-flex align-items-center w-100" style={{ maxWidth: '250px' }}>
              <Form.Label className="text-nowrap me-2 mb-0 fw-medium small text-secondary">Sort By:</Form.Label>
              <Form.Select
                value={sortOption}
                onChange={handleSortChange}
                size="sm"
                className="rounded-3 border-secondary-subtle py-2"
                style={{ fontSize: '0.85rem' }}
              >
                <option value="">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="title">Title: A to Z</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Search query feedback */}
        {searchQuery && (
          <p className="text-secondary small mb-4">
            Showing results for: <strong className="text-primary">"{searchQuery}"</strong>
            <button className="btn btn-link btn-sm text-danger p-0 ms-2 align-baseline" onClick={() => handleSearch('')}>
              Clear Search
            </button>
          </p>
        )}

        {/* Books List Grid */}
        {loading ? (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {[...Array(8)].map((_, i) => (
              <Col key={i}><SkeletonCard /></Col>
            ))}
          </Row>
        ) : books.length === 0 ? (
          <div className="text-center py-5">
            <span style={{ fontSize: '3rem' }}>🔍</span>
            <h4 className="fw-bold mt-3 text-dark">No Books Found</h4>
            <p className="text-muted small">We couldn't find any books matching your criteria. Try adjusting your search term.</p>
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

            {/* Pagination Controls */}
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

export default Books;
