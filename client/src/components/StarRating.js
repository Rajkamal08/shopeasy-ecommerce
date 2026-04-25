import React from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const StarRating = ({ rating, size = 14, showCount, count }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<FaStar key={i} size={size} className="star-filled" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<FaStarHalfAlt key={i} size={size} className="star-filled" />);
    } else {
      stars.push(<FaRegStar key={i} size={size} className="star-empty" />);
    }
  }

  return (
    <span className="stars">
      {stars}
      {showCount && <span style={{ marginLeft: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({count || 0})</span>}
    </span>
  );
};

export default StarRating;
