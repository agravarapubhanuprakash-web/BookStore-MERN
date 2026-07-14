import React from 'react';
import { Pagination as BPagination } from 'react-bootstrap';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  const items = [];

  for (let number = 1; number <= totalPages; number++) {
    items.push(
      <BPagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => onPageChange(number)}
      >
        {number}
      </BPagination.Item>
    );
  }

  return (
    <BPagination className="justify-content-center mt-4">
      <BPagination.Prev
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      />
      {items}
      <BPagination.Next
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </BPagination>
  );
};

export default Pagination;
