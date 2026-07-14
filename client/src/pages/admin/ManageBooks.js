import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Form, InputGroup, Row, Col, Modal } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaDownload, FaUpload } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import { formatPrice } from '../../utils/helpers';
import * as bookService from '../../services/bookService';
import * as adminService from '../../services/adminService';
import { toast } from 'react-toastify';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  
  // CSV Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const navigate = useNavigate();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      if (searchQuery) {
        const res = await bookService.searchBooks(searchQuery);
        if (res.success) {
          // Simple search results slice for pagination
          const limit = 10;
          const totalItems = res.books.length;
          setTotalPages(Math.ceil(totalItems / limit) || 1);
          const startIndex = (currentPage - 1) * limit;
          setBooks(res.books.slice(startIndex, startIndex + limit));
        }
      } else {
        const res = await bookService.getAllBooks(currentPage, 10);
        if (res.success) {
          setBooks(res.books || []);
          setTotalPages(res.pages || 1);
        }
      }
    } catch (error) {
      console.error('Error loading books:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [currentPage, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset page
  };

  const handleConfirmDelete = async () => {
    if (!selectedBookId) return;

    try {
      const res = await bookService.deleteBook(selectedBookId);
      if (res.success) {
        toast.info('Book deleted successfully');
        setShowDeleteModal(false);
        fetchBooks();
      }
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await adminService.exportBooksCSV();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bookstore_catalog.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('CSV catalogue exported successfully!');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const handleImportCSVSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    const formData = new FormData();
    formData.append('file', csvFile);

    setImporting(true);
    try {
      const res = await adminService.importBooksCSV(formData);
      if (res.success) {
        toast.success(res.message || 'CSV books imported successfully!');
        setShowImportModal(false);
        setCsvFile(null);
        fetchBooks();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'CSV Import failed. Check headers and categories.');
    } finally {
      setImporting(false);
    }
  };

  const handleOpenDelete = (id) => {
    setSelectedBookId(id);
    setShowDeleteModal(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="fw-bold mb-0 text-dark">Catalog Management</h2>
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="outline-success" size="sm" onClick={handleExportCSV} className="d-flex align-items-center gap-1">
            <FaDownload size={12} /> Export CSV
          </Button>
          <Button variant="outline-info" size="sm" onClick={() => setShowImportModal(true)} className="d-flex align-items-center gap-1 text-dark">
            <FaUpload size={12} /> Import CSV
          </Button>
          <Button as={Link} to="/admin/books/add" variant="primary" size="sm" className="d-flex align-items-center gap-1">
            <FaPlus size={12} /> Add Book
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <InputGroup className="mb-4 shadow-sm border border-secondary-subtle" style={{ maxWidth: '400px', borderRadius: '8px', overflow: 'hidden' }}>
        <InputGroup.Text className="bg-white border-0 text-muted"><FaSearch size={14} /></InputGroup.Text>
        <Form.Control
          placeholder="Search by title, author..."
          value={searchQuery}
          onChange={handleSearch}
          className="border-0 py-2 small"
          style={{ fontSize: '0.85rem' }}
        />
      </InputGroup>

      {loading ? (
        <Loader message="Loading books inventory..." />
      ) : books.length === 0 ? (
        <div className="text-center py-5 bg-white border rounded">
          <span style={{ fontSize: '3rem' }}>📚</span>
          <h5 className="fw-bold mt-3">No Books in Inventory</h5>
          <p className="text-muted small">Try creating one using the "Add Book" button above.</p>
        </div>
      ) : (
        <>
          <Table responsive hover className="align-middle bg-white border shadow-sm rounded">
            <thead>
              <tr className="table-light small text-uppercase text-secondary fw-bold">
                <th>Cover</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td>
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="rounded border"
                      style={{ width: '40px', height: '50px', objectFit: 'cover' }}
                    />
                  </td>
                  <td className="fw-bold small">{book.title}</td>
                  <td className="small text-secondary">{book.author}</td>
                  <td className="small">
                    <span className="category-badge m-0">{book.category?.name || 'General'}</span>
                  </td>
                  <td className="fw-bold small">{formatPrice(book.price)}</td>
                  <td>
                    {book.stock > 0 ? (
                      <Badge bg="success" className="px-2 py-1">{book.stock} left</Badge>
                    ) : (
                      <Badge bg="danger" className="px-2 py-1">Out of Stock</Badge>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => navigate(`/admin/books/edit/${book._id}`)}
                        title="Edit Book"
                      >
                        <FaEdit size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleOpenDelete(book._id)}
                        title="Delete Book"
                      >
                        <FaTrash size={11} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton className="bg-light py-2">
          <Modal.Title className="fw-bold text-danger" style={{ fontSize: '1rem' }}>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3 text-center">
          <p className="small mb-0">Are you sure you want to permanently delete this book from catalog inventory?</p>
        </Modal.Body>
        <Modal.Footer className="bg-light py-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleConfirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Import CSV Modal */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)} centered>
        <Modal.Header closeButton className="bg-light py-2">
          <Modal.Title className="fw-bold" style={{ fontSize: '1.1rem' }}>Import Books from CSV</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleImportCSVSubmit}>
          <Modal.Body className="py-3">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Upload CSV File</Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                required
                onChange={(e) => setCsvFile(e.target.files[0])}
              />
              <Form.Text className="text-muted small">
                Make sure your CSV contains headers matching: <strong>title, author, isbn, price, stock, category, publisher, pages, description</strong>.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-light py-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setShowImportModal(false)}>Close</Button>
            <Button type="submit" variant="primary" size="sm" disabled={importing}>
              {importing ? 'Importing...' : 'Upload & Import'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageBooks;
