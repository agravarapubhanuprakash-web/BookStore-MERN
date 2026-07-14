import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { FaBell, FaTrash } from 'react-icons/fa';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import { formatDate, getStatusColor } from '../../utils/helpers';
import * as reservationService from '../../services/reservationService';
import { toast } from 'react-toastify';

const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await reservationService.getAllReservations(currentPage);
      if (res.success) {
        setReservations(res.reservations || []);
        setTotalPages(res.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [currentPage]);

  const handleNotify = async (id, name, title) => {
    if (window.confirm(`Send restock email alert to ${name} for "${title}"?`)) {
      try {
        const res = await reservationService.notifyReservation(id);
        if (res.success) {
          toast.success('Restock notification email dispatched!');
          fetchReservations();
        }
      } catch (error) {
        toast.error('Failed to send notification email');
      }
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this book hold reservation?')) {
      try {
        const res = await reservationService.cancelReservation(id);
        if (res.success) {
          toast.info('Reservation cancelled');
          fetchReservations();
        }
      } catch (error) {
        toast.error('Failed to cancel reservation');
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h2 className="fw-bold mb-4 text-dark">Book Hold Reservations</h2>

      {loading ? (
        <Loader message="Loading reserved records..." />
      ) : reservations.length === 0 ? (
        <div className="text-center py-5 bg-white border rounded">
          <span style={{ fontSize: '3rem' }}>📌</span>
          <h5 className="fw-bold mt-3">No Active Reservations</h5>
          <p className="text-muted small">Holds placed on out-of-stock items list here.</p>
        </div>
      ) : (
        <>
          <Table responsive hover className="align-middle bg-white border shadow-sm rounded">
            <thead>
              <tr className="table-light small text-uppercase text-secondary fw-bold">
                <th>Book Title</th>
                <th>Customer</th>
                <th>Reserved Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => {
                const book = res.book || {};
                const userObj = res.user || {};
                return (
                  <tr key={res._id}>
                    <td className="fw-semibold small" style={{ maxWidth: '200px' }}>
                      <div className="text-truncate">{book.title || 'Unknown Title'}</div>
                      <div className="text-muted small">Stock: {book.stock || 0} copy(s)</div>
                    </td>
                    <td className="small">
                      <div>{userObj.name || 'Anonymous'}</div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{userObj.email}</div>
                    </td>
                    <td className="small text-secondary">{formatDate(res.createdAt)}</td>
                    <td>
                      <Badge bg={getStatusColor(res.status)} className="text-uppercase" style={{ fontSize: '0.6rem' }}>
                        {res.status}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        {res.status === 'active' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleNotify(res._id, userObj.name, book.title)}
                            disabled={book.stock <= 0} // Can only notify if stock is back
                            title={book.stock <= 0 ? 'Wait for replenishment to notify' : 'Notify customer'}
                            className="d-inline-flex align-items-center gap-1 small py-1 px-3"
                            style={{ fontSize: '0.75rem' }}
                          >
                            <FaBell size={10} /> Notify
                          </Button>
                        )}
                        {res.status !== 'cancelled' && res.status !== 'fulfilled' && (
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleCancel(res._id)}
                            title="Cancel Reservation"
                          >
                            <FaTrash size={10} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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

export default ManageReservations;
