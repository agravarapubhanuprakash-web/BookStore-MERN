import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import { FaCheckCircle, FaFileInvoice, FaArrowRight } from 'react-icons/fa';
import * as orderService from '../services/orderService';
import { toast } from 'react-toastify';

const OrderConfirmation = () => {
  const { id } = useParams();

  const handleDownloadInvoice = async () => {
    try {
      const blob = await orderService.getInvoice(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Invoice download failed:', error.message);
      toast.error('Failed to download invoice');
    }
  };

  return (
    <div className="fade-in py-5">
      <Container className="text-center">
        <Card className="border shadow-lg p-5 mx-auto bg-white" style={{ maxWidth: '550px' }}>
          <Card.Body className="p-0">
            <div className="text-success mb-4">
              <FaCheckCircle size={70} />
            </div>
            
            <h2 className="fw-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-muted small mb-4">
              Thank you for shopping at BookStore. Your order has been placed and is currently being processed. An order confirmation email has been sent.
            </p>

            <div className="bg-light p-3 rounded mb-4 text-start small">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Order ID:</span>
                <strong className="text-dark">{id}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Estimated Delivery:</span>
                <strong className="text-dark">3 to 5 business days</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Status:</span>
                <span className="badge bg-warning text-dark text-uppercase">Pending</span>
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Button
                variant="primary"
                onClick={handleDownloadInvoice}
                className="d-flex align-items-center justify-content-center gap-2 py-2 px-4"
              >
                <FaFileInvoice /> Download Invoice
              </Button>
              <Button
                as={Link}
                to="/orders"
                variant="outline-primary"
                className="d-flex align-items-center justify-content-center gap-2 py-2 px-4"
              >
                Track Order <FaArrowRight size={10} />
              </Button>
            </div>

            <hr className="my-4" />

            <Link to="/books" className="text-decoration-none small fw-medium">
              Continue Shopping &rarr;
            </Link>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default OrderConfirmation;
