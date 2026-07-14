import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import Loader from '../../components/Loader';
import * as categoryService from '../../services/categoryService';
import { toast } from 'react-toastify';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAllCategories();
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setSelectedCat(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setSelectedCat(cat);
    setFormData({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (selectedCat) {
        // Edit Category
        const res = await categoryService.updateCategory(selectedCat._id, formData);
        if (res.success) {
          toast.info('Category updated');
          setShowModal(false);
          fetchCategories();
        }
      } else {
        // Create Category
        const res = await categoryService.createCategory(formData);
        if (res.success) {
          toast.success('Category created');
          setShowModal(false);
          fetchCategories();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? (Will fail if books are assigned to it)')) {
      try {
        const res = await categoryService.deleteCategory(id);
        if (res.success) {
          toast.info('Category deleted');
          fetchCategories();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-dark">Category Management</h2>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="d-flex align-items-center gap-1">
          <FaPlus size={12} /> Add Category
        </Button>
      </div>

      {loading ? (
        <Loader message="Loading genres..." />
      ) : categories.length === 0 ? (
        <div className="text-center py-5 bg-white border rounded">
          <span style={{ fontSize: '3rem' }}>📂</span>
          <h5 className="fw-bold mt-3">No Categories Found</h5>
          <p className="text-muted small">Create categories to classify books in catalog.</p>
        </div>
      ) : (
        <Table responsive hover className="align-middle bg-white border shadow-sm rounded">
          <thead>
            <tr className="table-light small text-uppercase text-secondary fw-bold">
              <th>Category Name</th>
              <th>Description</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td className="fw-bold small">{cat.name}</td>
                <td className="small text-secondary">{cat.description || 'No description provided.'}</td>
                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <Button size="sm" variant="outline-primary" onClick={() => handleOpenEdit(cat)} title="Edit Category">
                      <FaEdit size={12} />
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(cat._id)} title="Delete Category">
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
            {selectedCat ? 'Edit Category' : 'Add New Category'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleModalSubmit}>
          <Modal.Body className="py-3">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Science Fiction"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of category publications..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-light py-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setShowModal(false)}>Close</Button>
            <Button type="submit" variant="primary" size="sm">
              {selectedCat ? 'Save Changes' : 'Create Category'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageCategories;
