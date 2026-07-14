import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { FaTrash, FaStar } from 'react-icons/fa';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import { formatDate } from '../../utils/helpers';
import * as reviewService from '../../services/reviewService';
import { toast } from 'react-toastify';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getAllReviews(currentPage);
      if (res.success) {
        setReviews(res.reviews || []);
        setTotalPages(res.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      try {
        const res = await reviewService.deleteReview(id);
        if (res.success) {
          toast.info('Review deleted');
          fetchReviews();
        }
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h2 className="fw-bold mb-4 text-dark">Review Moderation</h2>

      {loading ? (
        <Loader message="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <div className="text-center py-5 bg-white border rounded">
          <span style={{ fontSize: '3rem' }}>⭐</span>
          <h5 className="fw-bold mt-3">No Reviews Found</h5>
          <p className="text-muted small">All reader reviews will list here.</p>
        </div>
      ) : (
        <>
          <Table responsive hover className="align-middle bg-white border shadow-sm rounded">
            <thead>
              <tr className="table-light small text-uppercase text-secondary fw-bold">
                <th>Book</th>
                <th>Reader</th>
                <th>Score</th>
                <th>Comment</th>
                <th>Written Date</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r._id}>
                  <td className="fw-semibold small" style={{ maxWidth: '180px' }}>
                    <div className="text-truncate">{r.book?.title}</div>
                    <div className="text-muted small text-truncate" style={{ fontSize: '0.7rem' }}>By {r.book?.author}</div>
                  </td>
                  <td className="small">
                    <div>{r.user?.name || 'Anonymous'}</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{r.user?.email}</div>
                  </td>
                  <td>
                    <Badge bg="warning" className="text-dark d-inline-flex align-items-center gap-1 py-1 px-2 fw-bold" style={{ fontSize: '0.65rem' }}>
                      <FaStar /> {r.rating}
                    </Badge>
                  </td>
                  <td className="small text-secondary" style={{ maxWidth: '280px' }}>
                    <div className="text-truncate" title={r.comment}>{r.comment}</div>
                  </td>
                  <td className="small text-secondary">{formatDate(r.createdAt)}</td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(r._id)}
                      title="Delete Review"
                    >
                      <FaTrash size={11} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default ManageReviews;
