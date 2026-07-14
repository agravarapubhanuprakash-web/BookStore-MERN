import React, { useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating = 0, onChange, readOnly = true, size = 18 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseOver = (val) => {
    if (readOnly) return;
    setHoverRating(val);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  const handleClick = (val) => {
    if (readOnly || !onChange) return;
    onChange(val);
  };

  const stars = [];
  const displayRating = hoverRating || rating;

  for (let i = 1; i <= 5; i++) {
    if (i <= displayRating) {
      stars.push(
        <FaStar
          key={i}
          className="star"
          style={{ fontSize: `${size}px`, cursor: readOnly ? 'default' : 'pointer' }}
          onMouseOver={() => handleMouseOver(i)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(i)}
        />
      );
    } else {
      stars.push(
        <FaRegStar
          key={i}
          className="star empty"
          style={{ fontSize: `${size}px`, cursor: readOnly ? 'default' : 'pointer' }}
          onMouseOver={() => handleMouseOver(i)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(i)}
        />
      );
    }
  }

  return <div className="star-rating d-inline-flex">{stars}</div>;
};

export default StarRating;
