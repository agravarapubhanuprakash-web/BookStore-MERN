import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Form, Modal, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEdit, FaBell } from 'react-icons/fa';
import Loader from '../../components/Loader';
import { formatDate, getStatusColor } from '../../utils/helpers';
import * as adminService from '../../services/adminService';
import { toast } from 'react-toastify';

const ManageAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    isActive: true,
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllAnnouncements();
      if (res.success) {
        setAnnouncements(res.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAdd = () => {
    setSelectedAnn(null);
    setFormData({ title: '', message: '', type: 'info', isActive: true });
    setShowModal(true);
  };

  const handleOpenEdit = (ann) => {
    setSelectedAnn(ann);
    setFormData({
      title: ann.title,
      message: ann.message,
      type: ann.type || 'info',
      isActive: !!ann.isActive,
    });
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    try {
      if (selectedAnn) {
        // Edit Announcement
        const res = await adminService.updateAnnouncement(selectedAnn._id, formData);
        if (res.success) {
          toast.info('Announcement updated');
          setShowModal(false);
          fetchAnnouncements();
        }
      } else {
        // Create Announcement
        const res = await adminService.createAnnouncement(formData);
        if (res.success) {
          toast.success('Announcement created successfully');
          setShowModal(false);
          fetchAnnouncements();
        }
      }
    } catch (error) {
      toast.error('Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this announcement?')) {
      try {
        const res = await adminService.deleteAnnouncement(id);
        if (res.success) {
          toast.info('Announcement deleted');
          fetchAnnouncements();
        }
      } catch (error) {
        toast.error('Failed to delete announcement');
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-dark">Announcements Bulletin</h2>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="d-flex align-items-center gap-1">
          <FaPlus size={12} /> Publish Announcement
        </Button>
      </div>

      {loading ? (
        <Loader message="Loading notice boards..." />
      ) : announcements.length === 0 ? (
        <div className="text-center py-5 bg-white border rounded">
          <span style={{ fontSize: '3rem' }}>📢</span>
          <h5 className="fw-bold mt-3">No Announcements Active</h5>
          <p className="text-muted small">Publish announcements visible on Home page for users.</p>
        </div>
      ) : (
        <Table responsive hover className="align-middle bg-white border shadow-sm rounded">
          <thead>
            <tr className="table-light small text-uppercase text-secondary fw-bold">
              <th>Title</th>
              <th>Type</th>
              <th>Message</th>
              <th>Status</th>
              <th>Published Date</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((ann) => (
              <tr key={ann._id}>
                <td className="fw-bold small">{ann.title}</td>
                <td>
                  <Badge bg={ann.type || 'info'} className="text-uppercase" style={{ fontSize: '0.6rem' }}>
                    {ann.type}
                  </Badge>
                </td>
                <td className="small text-secondary" style={{ maxWidth: '250px' }}>
                  <div className="text-truncate" title={ann.message}>{ann.message}</div>
                </td>
                <td>
                  {ann.isActive ? (
                    <Badge bg="success" className="px-2 py-1 text-uppercase" style={{ fontSize: '0.6rem' }}>Visible</Badge>
                  ) : (
                    <Badge bg="secondary" className="px-2 py-1 text-uppercase" style={{ fontSize: '0.6rem' }}>Hidden</Badge>
                  )}
                </td>
                <td className="small text-secondary">{formatDate(ann.createdAt)}</td>
                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <Button size="sm" variant="outline-primary" onClick={() => handleOpenEdit(ann)} title="Edit Notice">
                      <FaEdit size={12} />
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(ann._id)} title="Delete Notice">
                      <FaTrash size={11} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-light py-2">
          <Modal.Title className="fw-bold" style={{ fontSize: '1.1rem' }}>
            {selectedAnn ? 'Edit Announcement' : 'Publish Announcement'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleModalSubmit}>
          <Modal.Body className="py-3">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Title</Form.Label>
              <Form.Control
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Server Maintenance or New Releases"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Bulletin Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write notice description..."
              />
            </Form.Group>

            <Row className="gy-3 align-items-center mb-2">
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Badge Accent Type</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="success">Success (Green)</option>
                    <option value="danger">Danger (Red)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col sm={6} className="mt-4">
                <Form.Check
                  type="checkbox"
                  id="switch-announcement-isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  label="Visible to readers"
                  className="fw-semibold text-dark small"
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="bg-light py-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setShowModal(false)}>Close</Button>
            <Button type="submit" variant="primary" size="sm">
              {selectedAnn ? 'Save Changes' : 'Publish Notice'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageAnnouncements;
