import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { formatPrice } from '../utils/helpers';
import * as orderService from '../services/orderService';
import * as paymentService from '../services/paymentService';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  // Autofill address if saved in user profile (only once when user loads)
  useEffect(() => {
    if (user && !shippingAddress.fullName && !shippingAddress.phone && !shippingAddress.street) {
      setShippingAddress({
        fullName: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'India',
      });
    }
  }, [user]);

  // Handle empty cart redirect only after items load
  useEffect(() => {
    if (!cartLoading && (!cartItems || cartItems.length === 0)) {
      toast.warning('Your cart is empty. Redirecting to books catalog...');
      navigate('/books');
    }
  }, [cartItems, cartLoading, navigate]);

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  // Price calculations
  const subtotal = cartTotal;
  const shippingPrice = subtotal > 500 ? 0 : 50;
  const taxPrice = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + shippingPrice + taxPrice;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street) {
      toast.error('Please fill in all shipping details');
      return;
    }

    setLoading(true);

    try {
      // 1. Prepare items for order
      const orderItems = cartItems.map((item) => ({
        book: item.book._id,
        quantity: item.quantity,
      }));

      // 2. Create the order on backend (status starts as pending)
      const res = await orderService.createOrder({
        items: orderItems,
        shippingAddress,
        paymentMethod,
      });

      if (!res.success || !res.order) {
        throw new Error('Order creation failed on server');
      }

      const orderId = res.order._id;

      // 3. Handle Payment
      if (paymentMethod === 'cod') {
        // COD order is done immediately
        toast.success('Order placed successfully via Cash on Delivery!');
        await clearCart();
        setLoading(false);
        navigate(`/order-confirmation/${orderId}`);
      } else {
        if (!window.Razorpay) {
          toast.error('Razorpay SDK failed to load. Please check your network connection.');
          setLoading(false);
          return;
        }
        // Online Payment: Create Razorpay Order
        const paymentRes = await paymentService.createRazorpayOrder(orderId);
        
        if (!paymentRes.success || !paymentRes.order) {
          throw new Error('Razorpay order creation failed');
        }

        const options = {
          key: paymentRes.key, // Razorpay API Key ID from backend
          amount: paymentRes.order.amount,
          currency: paymentRes.order.currency,
          name: 'BookStore Payments',
          description: `Payment for Order #${res.order.invoiceNumber}`,
          order_id: paymentRes.order.id,
          handler: async (response) => {
            setLoading(true);
            try {
              // Verify payment signature
              const verifyRes = await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderId,
              });

              if (verifyRes.success) {
                toast.success('Payment verified! Order placed successfully.');
                await clearCart();
                navigate(`/order-confirmation/${orderId}`);
              }
            } catch (err) {
              toast.error(err.response?.data?.message || 'Payment verification failed');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: shippingAddress.fullName,
            contact: shippingAddress.phone,
            email: user?.email || '',
          },
          theme: {
            color: '#2563eb', // Bookstore blue theme color
          },
          modal: {
            ondismiss: () => {
              toast.warning('Payment popup closed. You can pay from order details page.');
              navigate(`/orders/${orderId}`);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <Container>
        <h2 className="section-title mb-4">Secure Checkout</h2>

        <Form onSubmit={handlePlaceOrder}>
          <Row className="gy-4">
            {/* Left: Address details and payment method */}
            <Col lg={7}>
              {/* Shipping Form */}
              <Card className="border shadow-sm p-4 bg-white mb-4">
                <Card.Body className="p-0">
                  <h5 className="fw-bold mb-3 text-dark d-flex align-items-center">
                    <FaMapMarkerAlt className="text-primary me-2" /> Delivery Address
                  </h5>
                  
                  <Row className="gy-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">Receiver's Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          required
                          value={shippingAddress.fullName}
                          onChange={handleAddressChange}
                          placeholder="e.g. John Doe"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">Contact Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone"
                          required
                          value={shippingAddress.phone}
                          onChange={handleAddressChange}
                          placeholder="e.g. +91 98765 43210"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">Street Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="street"
                      required
                      value={shippingAddress.street}
                      onChange={handleAddressChange}
                      placeholder="e.g. Apartment No., Street Name, Area"
                    />
                  </Form.Group>

                  <Row className="gy-3 mb-2">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">City</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          required
                          value={shippingAddress.city}
                          onChange={handleAddressChange}
                          placeholder="e.g. Noida"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">State</Form.Label>
                        <Form.Control
                          type="text"
                          name="state"
                          required
                          value={shippingAddress.state}
                          onChange={handleAddressChange}
                          placeholder="e.g. Uttar Pradesh"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">Zip Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="zipCode"
                          required
                          value={shippingAddress.zipCode}
                          onChange={handleAddressChange}
                          placeholder="e.g. 201301"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">Country</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          required
                          value={shippingAddress.country}
                          onChange={handleAddressChange}
                          placeholder="India"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Payment Select */}
              <Card className="border shadow-sm p-4 bg-white">
                <Card.Body className="p-0">
                  <h5 className="fw-bold mb-3 text-dark">Payment Method</h5>
                  
                  <div className="d-flex flex-column gap-3">
                    <Form.Check
                      type="radio"
                      id="payment-cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      label={
                        <div className="d-flex align-items-center gap-2 cursor-pointer ms-2">
                          <FaMoneyBillWave className="text-success" />
                          <div>
                            <div className="fw-semibold">Cash on Delivery (COD)</div>
                            <div className="text-muted small">Pay in cash when the book is delivered</div>
                          </div>
                        </div>
                      }
                      className="border rounded p-3 d-flex align-items-start"
                    />

                    <Form.Check
                      type="radio"
                      id="payment-razorpay"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      label={
                        <div className="d-flex align-items-center gap-2 cursor-pointer ms-2">
                          <FaCreditCard className="text-primary" />
                          <div>
                            <div className="fw-semibold">Razorpay Online Payment</div>
                            <div className="text-muted small">Pay securely using Credit Cards, Debit Cards, NetBanking, or UPI</div>
                          </div>
                        </div>
                      }
                      className="border rounded p-3 d-flex align-items-start"
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Right: Checkout summary */}
            <Col lg={5}>
              <Card className="border shadow-sm p-4 bg-white sticky-top" style={{ top: '90px' }}>
                <Card.Body className="p-0">
                  <h5 className="fw-bold border-bottom pb-3 mb-3 text-dark">Your Order</h5>

                  {/* Items list */}
                  <div className="mb-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {cartItems.map((item) => (
                      <div key={item.book?._id} className="d-flex align-items-center justify-content-between mb-3 pr-2">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={item.book?.coverImage}
                            alt={item.book?.title}
                            className="rounded border"
                            style={{ width: '40px', height: '50px', objectFit: 'cover' }}
                          />
                          <div style={{ maxWidth: '200px' }}>
                            <div className="fw-semibold text-truncate small">{item.book?.title}</div>
                            <div className="text-muted small">Qty: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="fw-bold small">{formatPrice(item.book?.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>

                  <hr />

                  {/* Pricing details */}
                  <div className="d-flex justify-content-between mb-2 small text-secondary">
                    <span>Subtotal</span>
                    <span className="fw-medium text-dark">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2 small text-secondary">
                    <span>Shipping</span>
                    <span className="fw-medium text-dark">{shippingPrice === 0 ? 'FREE' : formatPrice(shippingPrice)}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-3 small text-secondary">
                    <span>GST (5%)</span>
                    <span className="fw-medium text-dark">{formatPrice(taxPrice)}</span>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between mb-4">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold fs-5 text-primary">{formatPrice(grandTotal)}</span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 py-3 fw-bold"
                    disabled={loading || cartItems.length === 0}
                  >
                    {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay & Place Order'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default Checkout;
