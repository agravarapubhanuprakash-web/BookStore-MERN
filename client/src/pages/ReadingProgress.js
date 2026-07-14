import React, { useState } from 'react';
import { Container, Card, Row, Col, ProgressBar, Button, Form, Modal } from 'react-bootstrap';
import { FaBookOpen, FaHistory, FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';
import api from '../services/api';

const ReadingProgress = () => {
  const { user, updateProfile } = useAuth();
  
  // Get reading progress array from user profile
  const progressList = user?.readingProgress || [];

  const [showModal, setShowModal] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState(null);
  const [newProgressPercent, setNewProgressPercent] = useState(0);

  const handleOpenModal = (item) => {
    setSelectedProgress(item);
    setNewProgressPercent(item.progress || 0);
    setShowModal(true);
  };

  const handleSaveProgress = async () => {
    if (!selectedProgress) return;
    
    try {
      // Map through user's readingProgress, update the selected book's percentage, and update on backend
      const updatedProgressList = progressList.map((item) => {
        const itemId = item.book?._id || item.book;
        const selectedId = selectedProgress.book?._id || selectedProgress.book;

        if (itemId.toString() === selectedId.toString()) {
          return {
            ...item,
            progress: parseInt(newProgressPercent, 10),
            lastReadAt: new Date().toISOString(),
          };
        }
        return item;
      });

      // Update the user's details on backend via updateProfile
      const res = await updateProfile({
        readingProgress: updatedProgressList,
      });

      if (res.success) {
        toast.success('Reading progress updated!');
        setShowModal(false);
      }
    } catch (error) {
      toast.error('Failed to save reading progress');
    }
  };

  return (
    <div className="fade-in">
      <Container>
        <h2 className="section-title mb-4">My Reading Progress</h2>

        {progressList.length === 0 ? (
          <div className="text-center py-5 bg-white border rounded shadow-sm">
            <span style={{ fontSize: '4rem', color: 'var(--border)' }}><FaBookOpen /></span>
            <h4 className="fw-bold mt-3 text-dark">No Reading Tracker Active</h4>
            <p className="text-muted small mb-4">Track progress of eBooks you are reading.</p>
            <Link to="/books" className="btn btn-primary px-4 py-2">
              Browse eBooks
            </Link>
          </div>
        ) : (
          <Row xs={1} md={2} className="g-4">
            {progressList.map((item, idx) => {
              const book = item.book || {};
              return (
                <Col key={book._id || idx}>
                  <Card className="border shadow-sm bg-white h-100 p-3">
                    <Card.Body className="d-flex p-0 gap-3">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="rounded border shadow-sm"
                        style={{ width: '80px', height: '110px', objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1 d-flex flex-column justify-content-between">
                        <div>
                          <h6 className="fw-bold text-dark mb-1 text-truncate" style={{ maxWidth: '240px' }} title={book.title}>
                            {book.title || 'Unknown Title'}
                          </h6>
                          <p className="text-muted small mb-2">By {book.author || 'Unknown Author'}</p>
                        </div>
                        
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-1 small">
                            <span className="text-secondary fw-semibold">Progress</span>
                            <span className="text-primary fw-bold">{item.progress}%</span>
                          </div>
                          <ProgressBar now={item.progress} variant="primary" style={{ height: '6px' }} className="mb-2" />
                          <div className="d-flex justify-content-between align-items-center small text-muted" style={{ fontSize: '0.7rem' }}>
                            <span className="d-flex align-items-center gap-1">
                              <FaHistory size={10} /> {item.lastReadAt ? formatDate(item.lastReadAt) : 'Not started'}
                            </span>
                            <Button
                              variant="link"
                              onClick={() => handleOpenModal(item)}
                              className="p-0 text-decoration-none d-flex align-items-center gap-1 text-primary"
                              style={{ fontSize: '0.75rem' }}
                            >
                              <FaEdit size={10} /> Update
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      {/* Modal update progress */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="sm">
        <Modal.Header closeButton className="bg-light py-2">
          <Modal.Title style={{ fontSize: '1rem' }} className="fw-bold">Update Progress</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          <Form.Group className="mb-3 text-center">
            <Form.Label className="fw-semibold text-secondary small mb-2">
              Set new progress: <span className="text-primary fw-bold">{newProgressPercent}%</span>
            </Form.Label>
            <Form.Range
              value={newProgressPercent}
              onChange={(e) => setNewProgressPercent(e.target.value)}
              min="0"
              max="100"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light py-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveProgress}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReadingProgress;
