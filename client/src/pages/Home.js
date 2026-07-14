import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import HeroBanner from '../components/HeroBanner';
import BookCard from '../components/BookCard';
import CategoryCard from '../components/CategoryCard';
import TestimonialCard from '../components/TestimonialCard';
import Newsletter from '../components/Newsletter';
import RecommendedBooks from '../components/RecommendedBooks';
import RecentlyViewed from '../components/RecentlyViewed';
import { SkeletonCard } from '../components/Loader';
import * as bookService from '../services/bookService';
import * as categoryService from '../services/categoryService';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [featuredRes, newArrivalsRes] = await Promise.all([
          bookService.getFeaturedBooks(),
          bookService.getNewArrivals()
        ]);
        if (featuredRes.success) setFeaturedBooks(featuredRes.books);
        if (newArrivalsRes.success) setNewArrivals(newArrivalsRes.books);
      } catch (error) {
        console.error('Error fetching home page books:', error.message);
      } finally {
        setLoadingBooks(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        if (res.success) setCategories(res.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error.message);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchBooks();
    fetchCategories();
  }, []);

  const hardcodedTestimonials = [
    {
      name: 'Rohan Sharma',
      role: '2nd Year CSE Student',
      comment: 'This website is exactly what we needed for exam prep! The engineering text books are cheaper than the offline market, and the delivery was incredibly fast.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100&h=100',
      rating: 5
    },
    {
      name: 'Sneha Patel',
      role: '3rd Year ECE Student',
      comment: 'I love the eBook download feature. Being able to read recommendations based on my semester books saved me a lot of searching time.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
      rating: 4
    },
    {
      name: 'Dr. Amit Verma',
      role: 'Assistant Professor, CSE',
      comment: 'An excellent reference platform. I recommend this bookstore to all my students for standard textbooks like Cormen and Pressman.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
      rating: 5
    }
  ];

  return (
    <div className="fade-in">
      {/* Hero Banner Section */}
      <HeroBanner />

      <Container>
        {/* Recommended Books Section (Only visible to logged in users) */}
        <RecommendedBooks />

        {/* Featured Books Section */}
        <div className="mb-5">
          <h3 className="section-title-center">Featured Books</h3>
          {loadingBooks ? (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {[...Array(4)].map((_, i) => (
                <Col key={i}><SkeletonCard /></Col>
              ))}
            </Row>
          ) : (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {featuredBooks.slice(0, 8).map((book) => (
                <Col key={book._id}>
                  <BookCard book={book} />
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Categories Section */}
        <div className="mb-5">
          <h3 className="section-title-center">Explore Categories</h3>
          {loadingCategories ? (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {[...Array(4)].map((_, i) => (
                <Col key={i}>
                  <div className="skeleton w-100 rounded-3" style={{ height: '120px' }}></div>
                </Col>
              ))}
            </Row>
          ) : (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {categories.slice(0, 8).map((cat) => (
                <Col key={cat._id}>
                  <CategoryCard
                    category={cat}
                    onClick={() => navigate(`/categories/${cat._id}`)}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* New Arrivals Section */}
        <div className="mb-5">
          <h3 className="section-title-center">New Arrivals</h3>
          {loadingBooks ? (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {[...Array(4)].map((_, i) => (
                <Col key={i}><SkeletonCard /></Col>
              ))}
            </Row>
          ) : (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {newArrivals.slice(0, 8).map((book) => (
                <Col key={book._id}>
                  <BookCard book={book} />
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Recently Viewed Section */}
        <RecentlyViewed />

        {/* Testimonials Section */}
        <div className="mb-5">
          <h3 className="section-title-center">What Our Readers Say</h3>
          <Row xs={1} md={3} className="g-4">
            {hardcodedTestimonials.map((t, index) => (
              <Col key={index}>
                <TestimonialCard
                  name={t.name}
                  role={t.role}
                  comment={t.comment}
                  avatar={t.avatar}
                  rating={t.rating}
                />
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      {/* Newsletter Subscription */}
      <Newsletter />
    </div>
  );
};

export default Home;
