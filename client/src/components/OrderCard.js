import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';

const OrderCard = ({ order }) => {
  const { items = [] } = order;

  // Build items description
  const primaryItem = items[0]?.title || 'Book';
  const remainingCount = items.length - 1;
  const itemsText = remainingCount > 0 ? `${primaryItem} and ${remainingCount} other item(s)` : primaryItem;

  return (
    <Card className="border shadow-sm mb-3">
      <Card.Body className="p-3">
        <Row className="align-items-center gy-2">
          <Col md={3}>
            <div className="small text-muted">Invoice No.</div>
            <div className="fw-semibold text-dark text-truncate">{order.invoiceNumber || order._id}</div>
          </Col>
          <Col md={2}>
            <div className="small text-muted">Placed On</div>
            <div className="small fw-medium text-secondary">{formatDate(order.createdAt)}</div>
          </Col>
          <Col md={3}>
            <div className="small text-muted">Items</div>
            <div className="small fw-semibold text-truncate text-secondary" title={itemsText}>{itemsText}</div>
          </Col>
          <Col md={2}>
            <div className="small text-muted">Total Amount</div>
            <div className="fw-bold text-primary">{formatPrice(order.totalPrice)}</div>
          </Col>
          <Col md={2} className="d-flex flex-column align-items-md-end gap-2">
            <Badge bg={getStatusColor(order.orderStatus)} className="px-2 py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
              {order.orderStatus}
            </Badge>
            <Link to={`/orders/${order._id}`} className="btn btn-outline-primary btn-sm px-3 py-1 mt-1" style={{ fontSize: '0.75rem' }}>
              Details
            </Link>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default OrderCard;
