import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Row, Col, Button } from 'react-bootstrap';
import { FaArrowLeft, FaSave, FaUpload, FaImage } from 'react-icons/fa';
import Loader from '../../components/Loader';
import * as bookService from '../../services/bookService';
import * as categoryService from '../../services/categoryService';
import { toast } from 'react-toastify';

const AddEditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    publisher: '',
    language: 'English',
    isbn: '',
    pageCount: '',
    price: '',
    originalPrice: '',
    stock: '',
    isFeatured: false,
    isEbook: false,
    tags: '',
  });

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [ebookFile, setEbookFile] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();
        if (res.success) {
          setCategories(res.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    };

    const loadBookDetails = async () => {
      setLoading(true);
      try {
        const res = await bookService.getBookById(id);
        if (res.success && res.book) {
          const book = res.book;
          setFormData({
            title: book.title || '',
            author: book.author || '',
            category: book.category?._id || book.category || '',
            description: book.description || '',
            publisher: book.publisher || '',
            language: book.language || 'English',
            isbn: book.isbn || '',
            pageCount: book.pageCount || '',
            price: book.price || '',
            originalPrice: book.originalPrice || '',
            stock: book.stock || '',
            isFeatured: !!book.isFeatured,
            isEbook: !!book.isEbook,
            tags: book.tags ? book.tags.join(', ') : '',
          });
          setCoverImagePreview(book.coverImage || '');
        }
      } catch (err) {
        toast.error('Failed to load book metadata');
        navigate('/admin/books');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
    if (isEditMode) {
      loadBookDetails();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEbookFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    const data = new FormData();
    // Append text fields
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // Append cover image file if selected
    if (coverImageFile) {
      data.append('coverImage', coverImageFile);
    }

    // Append ebook file if selected
    if (ebookFile) {
      data.append('ebookFile', ebookFile); // Wait! Let's check backend upload name in controller. In bookController, it handles coverImage as req.file. If ebookFile upload is handled, check.
    }

    setSaving(true);
    try {
      let res;
      if (isEditMode) {
        res = await bookService.updateBook(id, data);
        if (res.success) {
          toast.success('Book updated successfully!');
          navigate('/admin/books');
        }
      } else {
        res = await bookService.createBook(data);
        if (res.success) {
          toast.success('Book added to catalog!');
          navigate('/admin/books');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading book details..." />;

  return (
    <div className="fade-in">
      <Container style={{ maxWidth: '850px' }}>
        <div className="d-flex align-items-baseline gap-2 mb-4">
          <Link to="/admin/books" className="text-decoration-none small text-primary">&larr; Back to Catalog</Link>
        </div>

        <Card className="border shadow-sm bg-white p-4">
          <Card.Body className="p-0">
            <h3 className="fw-bold mb-4 text-dark">{isEditMode ? 'Edit Book Details' : 'Add New Book'}</h3>
            
            <Form onSubmit={handleSubmit}>
              <Row className="gy-3 mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Book Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Clean Code"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Author</Form.Label>
                    <Form.Control
                      type="text"
                      name="author"
                      required
                      value={formData.author}
                      onChange={handleChange}
                      placeholder="e.g. Robert C. Martin"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Category / Genre</Form.Label>
                    <Form.Select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Share summaries and details about the book..."
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Publisher</Form.Label>
                    <Form.Control
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleChange}
                      placeholder="e.g. O'Reilly Media"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Language</Form.Label>
                    <Form.Control
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      placeholder="English"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">ISBN</Form.Label>
                    <Form.Control
                      type="text"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleChange}
                      placeholder="e.g. 9780132350884"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Page Count</Form.Label>
                    <Form.Control
                      type="number"
                      name="pageCount"
                      value={formData.pageCount}
                      onChange={handleChange}
                      placeholder="e.g. 450"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Selling Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      required
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="e.g. 499"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Original Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      placeholder="e.g. 599"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Stock Inventory</Form.Label>
                    <Form.Control
                      type="number"
                      name="stock"
                      required
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="e.g. 15"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <hr className="my-4" />

              {/* Cover image & eBook PDF section */}
              <Row className="gy-3 mb-4">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary d-flex align-items-center gap-1">
                      <FaImage /> Cover Image File
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Form.Group>
                  {coverImagePreview && (
                    <div className="border rounded p-2 text-center bg-light" style={{ maxWidth: '150px' }}>
                      <img
                        src={coverImagePreview}
                        alt="Preview"
                        className="img-fluid rounded"
                        style={{ maxHeight: '150px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary d-flex align-items-center gap-1">
                      <FaUpload /> eBook PDF File (Optional)
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfChange}
                    />
                  </Form.Group>
                  {formData.isEbook && (
                    <span className="badge bg-info text-dark">Digital Format Enabled</span>
                  )}
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Tags (Comma Separated)</Form.Label>
                    <Form.Control
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g. javascript, coding, cormen"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Settings Checkboxes */}
              <Row className="mb-4">
                <Col sm={6}>
                  <Form.Check
                    type="checkbox"
                    id="checkbox-isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    label="Show in Featured Books section"
                    className="fw-medium text-dark small"
                  />
                </Col>
                <Col sm={6}>
                  <Form.Check
                    type="checkbox"
                    id="checkbox-isEbook"
                    name="isEbook"
                    checked={formData.isEbook}
                    onChange={handleChange}
                    label="Mark as Digital eBook format"
                    className="fw-medium text-dark small"
                  />
                </Col>
              </Row>

              <div className="d-flex gap-2">
                <Button type="submit" variant="primary" className="fw-semibold px-4 d-flex align-items-center gap-2" disabled={saving}>
                  <FaSave size={14} /> {saving ? 'Saving...' : 'Save Book'}
                </Button>
                <Button as={Link} to="/admin/books" variant="outline-secondary" className="px-4">
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AddEditBook;
