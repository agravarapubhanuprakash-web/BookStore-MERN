import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Table, Badge, Button, ProgressBar } from 'react-bootstrap';
import { FaFileInvoice, FaArrowLeft, FaCheck, FaCreditCard } from 'react-icons/fa';
import Loader from '../components/Loader';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';
import * as orderService from '../services/orderService';
import * as paymentService from '../services/paymentService';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const res = await orderService.getOrderById(id);
      if (res.success) {
        setOrder(res.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error.message);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleDownloadInvoice = async () => {
    try {
      const blob = await orderService.getInvoice(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${order.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handlePayNow = async () => {
    if (!window.Razorpay) {
      toast.error('Razorpay SDK failed to load. Please check your network connection.');
      return;
    }
    setPaymentLoading(true);
    try {
      const paymentRes = await paymentService.createRazorpayOrder(order._id);
      if (!paymentRes.success || !paymentRes.order) {
        throw new Error('Failed to create payment order');
      }

      const options = {
        key: paymentRes.key,
        amount: paymentRes.order.amount,
        currency: paymentRes.order.currency,
        name: 'BookStore Payments',
        description: `Complete Payment for Order #${order.invoiceNumber}`,
        order_id: paymentRes.order.id,
        handler: async (response) => {
          setLoading(true);
          try {
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });

            if (verifyRes.success) {
              toast.success('Payment completed successfully!');
              fetchOrderDetails();
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: order.shippingAddress.fullName,
          contact: order.shippingAddress.phone,
          email: user?.email || '',
        },
        theme: {
          color: '#2563eb',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.message || 'Payment process failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <Loader message="Loading order details..." />;
  if (!order) return <div className="text-center py-5"><h4>Order Not Found</h4></div>;

  // Status index calculations for progress tracker
  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = statusSteps.indexOf(order.orderStatus);
  const progressPercent = ((currentStepIndex + 1) / statusSteps.length) * 100;

  return (
    <div className="fade-in">
      <Container>
        <div className="d-flex align-items-baseline gap-2 mb-4">
          <Link to="/orders" className="text-decoration-none small text-primary">&larr; Back to My Orders</Link>
        </div>

        <Row className="gy-4">
          {/* Left panel: Info & Items table */}
          <Col lg={8}>
            <Card className="border shadow-sm bg-white mb-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0">Order Details</h4>
                  <Badge bg={getStatusColor(order.orderStatus)} className="px-3 py-2 text-uppercase fs-6">
                    {order.orderStatus}
                  </Badge>
                </div>

                {/* Progress bar timeline */}
                <div className="mb-4 bg-light p-4 rounded border">
                  <h6 className="fw-bold mb-3 small text-secondary text-uppercase">Tracking Progress</h6>
                  <ProgressBar now={progressPercent} variant="success" className="mb-3" style={{ height: '8px' }} />
                  <div className="d-flex justify-content-between small text-secondary text-uppercase font-weight-bold" style={{ fontSize: '0.75rem' }}>
                    <span className={currentStepIndex >= 0 ? 'text-success fw-bold' : ''}>Pending</span>
                    <span className={currentStepIndex >= 1 ? 'text-success fw-bold' : ''}>Processing</span>
                    <span className={currentStepIndex >= 2 ? 'text-success fw-bold' : ''}>Shipped</span>
                    <span className={currentStepIndex >= 3 ? 'text-success fw-bold' : ''}>Delivered</span>
                  </div>
                </div>

                {/* Ordered Items Table */}
                <Table responsive hover className="align-middle">
                  <thead>
                    <tr className="table-light small">
                      <th>Book</th>
                      <th>Price</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item._id || item.book}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {item.book?.coverImage || item.image ? (
                              <img
                                src={item.book?.coverImage || item.image}
                                alt={item.title}
                                className="rounded border"
                                style={{ width: '40px', height: '50px', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ fontSize: '1.5rem' }}>📖</span>
                            )}
                            <div>
                              <div className="fw-bold small">{item.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="small text-secondary">{formatPrice(item.price)}</td>
                        <td className="text-center small text-secondary">{item.quantity}</td>
                        <td className="text-end fw-bold small">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* Right panel: Totals & Invoice downloading */}
          <Col lg={4}>
            <Card className="border shadow-sm p-4 bg-white mb-4">
              <Card.Body className="p-0">
                <h5 className="fw-bold border-bottom pb-3 mb-3 text-dark">Summary</h5>
                
                <div className="d-flex justify-content-between mb-2 small text-secondary">
                  <span>Invoice No.</span>
                  <strong className="text-dark">{order.invoiceNumber}</strong>
                </div>

                <div className="d-flex justify-content-between mb-2 small text-secondary">
                  <span>Placed On</span>
                  <span className="text-dark fw-medium">{formatDate(order.createdAt)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2 small text-secondary">
                  <span>Payment Method</span>
                  <span className="text-dark fw-medium text-uppercase">{order.paymentMethod}</span>
                </div>

                <div className="d-flex justify-content-between mb-3 small text-secondary">
                  <span>Payment Status</span>
                  <Badge bg={getStatusColor(order.paymentStatus)} className="text-uppercase" style={{ fontSize: '0.65rem' }}>
                    {order.paymentStatus}
                  </Badge>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold">Total Price</span>
                  <span className="fw-bold fs-5 text-primary">{formatPrice(order.totalPrice)}</span>
                </div>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    onClick={handleDownloadInvoice}
                    className="d-flex align-items-center justify-content-center gap-2 py-2 small"
                  >
                    <FaFileInvoice /> Download Invoice
                  </Button>

                  {/* Pay online button if unpaid online method */}
                  {order.paymentMethod === 'razorpay' && order.paymentStatus === 'pending' && (
                    <Button
                      variant="warning"
                      onClick={handlePayNow}
                      disabled={paymentLoading}
                      className="d-flex align-items-center justify-content-center gap-2 py-2 small text-dark"
                    >
                      <FaCreditCard /> {paymentLoading ? 'Opening Razorpay...' : 'Complete Payment'}
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Delivery address panel */}
            <Card className="border shadow-sm p-4 bg-white">
              <Card.Body className="p-0">
                <h5 className="fw-bold border-bottom pb-3 mb-3 text-dark">Delivery Address</h5>
                <div className="small text-secondary">
                  <div className="fw-bold text-dark mb-1">{order.shippingAddress?.fullName}</div>
                  <div className="mb-2">Phone: {order.shippingAddress?.phone}</div>
                  <div className="lh-base">
                    {order.shippingAddress?.street},<br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.zipCode},<br />
                    {order.shippingAddress?.country}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OrderDetails;
