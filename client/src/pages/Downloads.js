import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Button } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import * as orderService from '../services/orderService';
import * as bookService from '../services/bookService';
import { formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';

const Downloads = () => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchasedEbooks = async () => {
      try {
        const res = await orderService.getMyOrders();
        if (res.success) {
          const orders = res.orders || [];
          
          // Gather all items from successful orders
          const purchasedItems = [];
          for (const order of orders) {
            // Include paid orders or successful orders (COD is paid on delivery, but for ebooks, paid orders only makes sense, though for demo we can include all successful ones!)
            if (order.paymentStatus === 'paid' || order.orderStatus === 'delivered') {
              for (const item of order.items) {
                purchasedItems.push({
                  bookId: item.book?._id || item.book,
                  title: item.title,
                  purchasedOn: order.createdAt,
                });
              }
            }
          }

          // Fetch full book metadata to verify if it is an eBook and get its PDF URL
          const verifiedEbooks = [];
          for (const item of purchasedItems) {
            try {
              const bookRes = await bookService.getBookById(item.bookId);
              if (bookRes.success && bookRes.book && bookRes.book.isEbook) {
                // Avoid listing duplicates of same purchased book
                if (!verifiedEbooks.some((e) => e._id === bookRes.book._id)) {
                  verifiedEbooks.push({
                    ...bookRes.book,
                    purchasedOn: item.purchasedOn,
                  });
                }
              }
            } catch (err) {
              console.error(`Failed to verify book ${item.bookId}:`, err.message);
            }
          }

          setEbooks(verifiedEbooks);
        }
      } catch (error) {
        console.error('Error fetching downloads:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedEbooks();
  }, []);

  const handleDownload = (ebookUrl, title) => {
    if (!ebookUrl) {
      toast.error('Download link not available for this book');
      return;
    }
    toast.success(`Starting download for ${title}...`);
    window.open(ebookUrl, '_blank');
  };

  if (loading) return <Loader message="Loading your digital shelf..." />;

  return (
    <div className="fade-in">
      <Container>
        <h2 className="section-title mb-4">My Digital Shelf</h2>

        {ebooks.length === 0 ? (
          <div className="text-center py-5 bg-white border rounded shadow-sm">
            <span style={{ fontSize: '4rem', color: 'var(--border)' }}><FaDownload /></span>
            <h4 className="fw-bold mt-3 text-dark">No Purchased eBooks</h4>
            <p className="text-muted small mb-4">eBooks you purchase will appear here for instant download.</p>
            <Link to="/books" className="btn btn-primary px-4 py-2">
              Explore eBooks
            </Link>
          </div>
        ) : (
          <Card className="border shadow-sm p-4 bg-white">
            <Card.Body className="p-0">
              <Table responsive hover className="align-middle mb-0">
                <thead>
                  <tr className="table-light small text-uppercase fw-bold text-secondary">
                    <th>Book Details</th>
                    <th>Purchased On</th>
                    <th>File Format</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ebooks.map((ebook) => (
                    <tr key={ebook._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={ebook.coverImage}
                            alt={ebook.title}
                            className="rounded border"
                            style={{ width: '40px', height: '50px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-bold small">{ebook.title}</div>
                            <div className="text-muted small">By {ebook.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="small text-secondary">{formatDate(ebook.purchasedOn)}</td>
                      <td>
                        <span className="badge bg-danger text-uppercase" style={{ fontSize: '0.65rem' }}>PDF</span>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="primary"
                          size="sm"
                          className="d-inline-flex align-items-center gap-1 py-2 px-3 small"
                          onClick={() => handleDownload(ebook.ebookUrl, ebook.title)}
                        >
                          <FaDownload size={11} /> Download PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default Downloads;
