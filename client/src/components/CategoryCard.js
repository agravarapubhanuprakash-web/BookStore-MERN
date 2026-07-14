import React from 'react';
import { Card } from 'react-bootstrap';
import * as Icons from 'react-icons/fa';
import { CATEGORY_ICONS } from '../utils/constants';

const CategoryCard = ({ category, onClick }) => {
  // Resolve icon dynamically using the constant mapping
  const iconName = CATEGORY_ICONS[category.name] || 'FaBook';
  const IconComponent = Icons[iconName] || Icons.FaBook;

  return (
    <Card className="category-card text-center shadow-sm h-100" onClick={onClick}>
      <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
        <div className="category-card-icon mb-3">
          <IconComponent />
        </div>
        <Card.Title className="fw-bold mb-2 text-dark" style={{ fontSize: '1.1rem' }}>
          {category.name}
        </Card.Title>
        {category.description && (
          <Card.Text className="text-muted small mb-0" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {category.description}
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );
};

export default CategoryCard;
