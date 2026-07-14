import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Form, Button } from 'react-bootstrap';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';
import * as orderService from '../../services/orderService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrders(currentPage);
      if (res.success) {
        setOrders(res.orders || []);
        setTotalPages(res.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const handleStatusChange = async (id, invoice, newStatus) => {
    if (window.confirm(`Are you sure you want to update Order #${invoice} status to ${newStatus.toUpperCase()}?`)) {
      try {
        const res = await orderService.updateOrderStatus(id, newStatus);
        if (res.success) {
          toast.success(`Order #${invoice} updated to ${newStatus.toUpperCase()}`);
          fetchOrders();
        }
      } catch (error) {
        toast.error('Failed to update order status');
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h2 className="fw-bold mb-4 text-dark">Order Dispatch Management</h2>

      {loading ? (
        <Loader message="Loading active shipments..." />
      ) : orders.length === 0 ? (
        <div className="text-center py-5 bg-white border rounded">
          <span style={{ fontSize: '3rem' }}>📦</span>
          <h5 className="fw-bold mt-3">No Orders Placed Yet</h5>
          <p className="text-muted small">All placement records will list here.</p>
        </div>
      ) : (
        <>
          <Table responsive hover className="align-middle bg-white border shadow-sm rounded">
            <thead>
              <tr className="table-light small text-uppercase text-secondary fw-bold">
                <th>Invoice</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Placed Date</th>
                <th>Total Price</th>
                <th>Status</th>
                <th className="text-end">Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="fw-bold small">{order.invoiceNumber}</td>
                  <td className="small">
                    <div>{order.user?.name || 'Guest User'}</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{order.user?.email}</div>
                  </td>
                  <td>
                    <div className="small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                      {order.paymentMethod}
                    </div>
                    <Badge bg={getStatusColor(order.paymentStatus)} className="text-uppercase" style={{ fontSize: '0.55rem' }}>
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="small text-secondary">{formatDate(order.createdAt)}</td>
                  <td className="fw-bold small text-primary">{formatPrice(order.totalPrice)}</td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, order.invoiceNumber, e.target.value)}
                      className="border border-secondary-subtle font-weight-bold"
                      style={{ fontSize: '0.75rem', width: '120px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </td>
                  <td className="text-end">
                    <Link to={`/orders/${order._id}`} className="btn btn-light btn-sm text-primary fw-medium" style={{ fontSize: '0.75rem' }}>
                      Details
                    </Link>
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

export default ManageOrders;
