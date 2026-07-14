import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Tabs, Tab, Badge } from 'react-bootstrap';
import { FaUser, FaPhone, FaMapMarkerAlt, FaLock, FaCamera } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import * as authService from '../services/authService';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile, updateProfileImage } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
  });

  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync user details on mount/refresh
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
      });
      if (user.address) {
        setAddressData({
          street: user.address.street || '',
          city: user.address.city || '',
          state: user.address.state || '',
          zipCode: user.address.zipCode || '',
          country: user.address.country || 'India',
        });
      }
      setImagePreview(user.profileImage || '');
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Generate a local preview url
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // First upload profile image if selected
    if (imageFile) {
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      const imgRes = await updateProfileImage(formData);
      if (!imgRes.success) {
        toast.error('Failed to upload profile picture');
        setLoading(false);
        return;
      }
      setImageFile(null); // Clear file
    }

    // Then update text profile info
    const res = await updateProfile({
      ...profileData,
      address: addressData,
    });
    setLoading(false);

    if (res.success) {
      toast.success('Profile details updated successfully!');
    } else {
      toast.error(res.message || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      );
      if (res.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <Container>
        <h2 className="section-title mb-4">My Profile</h2>

        <Row className="gy-4">
          {/* Left panel: Avatar Card */}
          <Col lg={4}>
            <Card className="border shadow-sm text-center p-4 bg-white">
              <Card.Body className="p-0">
                <div className="position-relative d-inline-block mx-auto mb-3" style={{ width: '150px', height: '150px' }}>
                  <img
                    src={imagePreview || 'https://res.cloudinary.com/demo/image/upload/v1570975200/sample.jpg'}
                    alt={user?.name}
                    className="rounded-circle border w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="position-absolute bottom-0 end-0 bg-primary text-white p-2 rounded-circle border shadow"
                    style={{ cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FaCamera size={14} />
                    <input
                      type="file"
                      id="profile-image-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="d-none"
                    />
                  </label>
                </div>

                <h4 className="fw-bold mb-1 text-dark">{user?.name}</h4>
                <p className="text-muted small mb-2">{user?.email}</p>
                <Badge bg={user?.role === 'admin' ? 'danger' : 'primary'} className="text-uppercase px-3 py-1 mb-3" style={{ fontSize: '0.65rem' }}>
                  {user?.role}
                </Badge>

                {imageFile && (
                  <p className="text-info small fw-medium mb-0">New picture selected! Click "Save Changes" below to upload.</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Right panel: Tabs details */}
          <Col lg={8}>
            <Card className="border shadow-sm bg-white overflow-hidden">
              <Tabs defaultActiveKey="profile" id="profile-tabs" className="bg-light border-bottom">
                
                {/* Profile Edit Tab */}
                <Tab eventKey="profile" title={<span><FaUser className="me-2" /> Personal Details</span>} className="p-4">
                  <Form onSubmit={handleProfileSubmit}>
                    <h5 className="fw-bold mb-3 text-dark">Personal Information</h5>
                    <Row className="gy-3 mb-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold text-secondary">Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            required
                            value={profileData.name}
                            onChange={handleProfileChange}
                            placeholder="John Doe"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold text-secondary">Phone Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            placeholder="+91 98765 43210"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <h5 className="fw-bold mb-3 text-dark d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2 text-primary" /> Shipping Address
                    </h5>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">Street Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="street"
                        value={addressData.street}
                        onChange={handleAddressChange}
                        placeholder="House No., Street Name, Area"
                      />
                    </Form.Group>
                    
                    <Row className="gy-3 mb-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold text-secondary">City</Form.Label>
                          <Form.Control
                            type="text"
                            name="city"
                            value={addressData.city}
                            onChange={handleAddressChange}
                            placeholder="Delhi"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold text-secondary">State / Province</Form.Label>
                          <Form.Control
                            type="text"
                            name="state"
                            value={addressData.state}
                            onChange={handleAddressChange}
                            placeholder="Delhi"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold text-secondary">Zip / Postal Code</Form.Label>
                          <Form.Control
                            type="text"
                            name="zipCode"
                            value={addressData.zipCode}
                            onChange={handleAddressChange}
                            placeholder="110001"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold text-secondary">Country</Form.Label>
                          <Form.Control
                            type="text"
                            name="country"
                            value={addressData.country}
                            onChange={handleAddressChange}
                            placeholder="India"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button type="submit" variant="primary" className="fw-semibold px-4" disabled={loading}>
                      {loading ? 'Saving Changes...' : 'Save Changes'}
                    </Button>
                  </Form>
                </Tab>

                {/* Change Password Tab */}
                <Tab eventKey="password" title={<span><FaLock className="me-2" /> Security Settings</span>} className="p-4">
                  <Form onSubmit={handlePasswordSubmit}>
                    <h5 className="fw-bold mb-3 text-dark">Change Password</h5>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="oldPassword"
                        required
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary">New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        required
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Min 6 characters"
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-semibold text-secondary">Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmNewPassword"
                        required
                        value={passwordData.confirmNewPassword}
                        onChange={handlePasswordChange}
                        placeholder="Repeat new password"
                      />
                    </Form.Group>

                    <Button type="submit" variant="primary" className="fw-semibold px-4" disabled={loading}>
                      {loading ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </Form>
                </Tab>

              </Tabs>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;
