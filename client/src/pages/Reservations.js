import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Badge, Button } from 'react-bootstrap';
import { FaBookmark } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { formatDate, getStatusColor } from '../utils/helpers';
import * as reservationService from '../services/reservationService';
import { toast } from 'react-toastify';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const res = await reservationService.getMyReservations();
      if (res.success) {
        setReservations(res.reservations || []);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        const res = await reservationService.cancelReservation(id);
        if (res.success) {
          toast.info('Reservation cancelled successfully');
          fetchReservations();
        }
      } catch (error) {
        toast.error('Failed to cancel reservation');
      }
    }
  };

  if (loading) return <Loader message="Loading your reserved books..." />;

  return (
    <div className="fade-in">
      <Container>
        <h2 className="section-title mb-4">Reserved Books</h2>

        {reservations.length === 0 ? (
          <div className="text-center py-5 bg-white border rounded shadow-sm">
            <span style={{ fontSize: '4rem', color: 'var(--border)' }}><FaBookmark /></span>
            <h4 className="fw-bold mt-3 text-dark">No Reservations Found</h4>
            <p className="text-muted small mb-4">You haven't reserved any out-of-stock books yet.</p>
            <Link to="/books" className="btn btn-primary px-4 py-2">
              Browse Books
            </Link>
          </div>
        ) : (
          <Card className="border shadow-sm p-4 bg-white">
            <Card.Body className="p-0">
              <Table responsive hover className="align-middle">
                <thead>
                  <tr className="table-light small text-uppercase fw-bold text-secondary">
                    <th>Book Details</th>
                    <th>Reserved On</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => {
                    const book = res.book || {};
                    return (
                      <tr key={res._id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {book.coverImage ? (
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="rounded border"
                                style={{ width: '40px', height: '50px', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ fontSize: '1.5rem' }}>📖</span>
                            )}
                            <div>
                              <div className="fw-bold small">{book.title || 'Unknown Book'}</div>
                              <div className="text-muted small">By {book.author || 'Unknown'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="small text-secondary">{formatDate(res.createdAt)}</td>
                        <td>
                          <Badge bg={getStatusColor(res.status)} className="px-2 py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
                            {res.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          {res.status === 'active' && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleCancel(res._id)}
                              className="small"
                              style={{ fontSize: '0.75rem' }}
                            >
                              Cancel Hold
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default Reservations;
