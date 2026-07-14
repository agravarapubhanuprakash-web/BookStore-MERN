import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import useCart from '../hooks/useCart';
import CartItem from '../components/CartItem';
import Loader from '../components/Loader';
import { formatPrice } from '../utils/helpers';

const Cart = () => {
  const { cartItems, cartTotal, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  // Price calculations
  const subtotal = cartTotal;
  const shippingPrice = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const taxPrice = Math.round(subtotal * 0.05); // 5% GST on books
  const grandTotal = subtotal + shippingPrice + taxPrice;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) return <Loader message="Loading your shopping cart..." />;

  return (
    <div className="fade-in">
      <Container>
        <h2 className="section-title mb-4">Shopping Cart</h2>

        {cartItems.length === 0 ? (
          <div className="text-center py-5 bg-white border rounded shadow-sm">
            <span style={{ fontSize: '4rem', color: 'var(--border)' }}><FaShoppingCart /></span>
            <h4 className="fw-bold mt-3 text-dark">Your Cart is Empty</h4>
            <p className="text-muted small mb-4 font-weight-medium">You haven't added any books to your cart yet.</p>
            <Link to="/books" className="btn btn-primary px-4 py-2">
              Start Shopping
            </Link>
          </div>
        ) : (
          <Row className="gy-4">
            {/* Cart Items List */}
            <Col lg={8}>
              <Card className="border shadow-sm p-4 bg-white">
                <Card.Body className="p-0">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                    <h5 className="fw-bold text-dark mb-0">Cart Items ({cartItems.length})</h5>
                    <Link to="/books" className="text-decoration-none text-primary small d-inline-flex align-items-center gap-1">
                      <FaArrowLeft size={10} /> Continue Shopping
                    </Link>
                  </div>
                  
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.book?._id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </Card.Body>
              </Card>
            </Col>

            {/* Order Summary Sidebar */}
            <Col lg={4}>
              <Card className="border shadow-sm p-4 bg-white sticky-top" style={{ top: '90px' }}>
                <Card.Body className="p-0">
                  <h5 className="fw-bold border-bottom pb-3 mb-3 text-dark">Order Summary</h5>
                  
                  <div className="d-flex justify-content-between mb-2 small text-secondary">
                    <span>Subtotal</span>
                    <span className="fw-medium text-dark">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2 small text-secondary">
                    <span>Shipping</span>
                    <span className="fw-medium text-dark">
                      {shippingPrice === 0 ? <span className="text-success fw-bold">FREE</span> : formatPrice(shippingPrice)}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between mb-3 small text-secondary">
                    <span>Taxes (5% GST)</span>
                    <span className="fw-medium text-dark">{formatPrice(taxPrice)}</span>
                  </div>

                  <hr className="my-3" />

                  <div className="d-flex justify-content-between mb-4">
                    <span className="fw-bold text-dark">Total</span>
                    <span className="fw-bold fs-5 text-primary">{formatPrice(grandTotal)}</span>
                  </div>

                  {shippingPrice > 0 && (
                    <div className="alert alert-info py-2 px-3 small border-0 mb-4" style={{ borderRadius: '8px' }}>
                      Add books worth <strong>{formatPrice(500 - subtotal)}</strong> more to get <strong>FREE shipping</strong>!
                    </div>
                  )}

                  <Button
                    variant="primary"
                    className="w-100 py-3 fw-bold fs-6"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Cart;
