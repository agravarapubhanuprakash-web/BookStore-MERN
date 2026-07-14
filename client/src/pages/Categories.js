import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import CategoryCard from '../components/CategoryCard';
import Loader from '../components/Loader';
import * as categoryService from '../services/categoryService';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        if (res.success) {
          setCategories(res.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (catId) => {
    navigate(`/categories/${catId}`);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fade-in">
      <Container>
        <h2 className="section-title mb-4">Book Categories</h2>
        
        {/* Category search filter */}
        <Form.Group className="mb-4" style={{ maxWidth: '400px' }}>
          <Form.Control
            type="text"
            placeholder="Filter categories by name..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="px-4 py-2 border rounded-pill shadow-sm"
          />
        </Form.Group>

        {loading ? (
          <Loader message="Loading categories..." />
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-5">
            <span style={{ fontSize: '3rem' }}>📂</span>
            <h5 className="fw-bold mt-3 text-dark">No Categories Found</h5>
            <p className="text-muted small">No categories match your search filter.</p>
          </div>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredCategories.map((cat) => (
              <Col key={cat._id}>
                <CategoryCard
                  category={cat}
                  onClick={() => handleCategoryClick(cat._id)}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Categories;
