import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaBoxOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import OrderCard from '../components/OrderCard';
import Loader from '../components/Loader';
import * as orderService from '../services/orderService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <Loader message="Loading your order history..." />;

  return (
    <div className="fade-in">
      <Container>
        <h2 className="section-title mb-4">My Orders</h2>

        {orders.length === 0 ? (
          <div className="text-center py-5 bg-white border rounded shadow-sm">
            <span style={{ fontSize: '4rem', color: 'var(--border)' }}><FaBoxOpen /></span>
            <h4 className="fw-bold mt-3 text-dark">No Orders Found</h4>
            <p className="text-muted small mb-4">You haven't placed any orders yet.</p>
            <Link to="/books" className="btn btn-primary px-4 py-2">
              Start Browsing
            </Link>
          </div>
        ) : (
          <Row>
            <Col lg={10} className="mx-auto">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Orders;
