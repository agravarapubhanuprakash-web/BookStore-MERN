import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import { FaSearch, FaUserTag, FaBan, FaCheck } from 'react-icons/fa';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import { formatDate } from '../../utils/helpers';
import * as adminService from '../../services/adminService';
import { toast } from 'react-toastify';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers(currentPage, searchQuery);
      if (res.success) {
        setUsers(res.users || []);
        setTotalPages(res.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching users:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
  setCurrentPage(page);
};

  const handleToggleBlock = async (id, name, isCurrentlyBlocked) => {
    const action = isCurrentlyBlocked ? 'activate' : 'block';
    if (window.confirm(`Are you sure you want to ${action} ${name}'s account?`)) {
      try {
        const res = await adminService.toggleUserBlock(id);
        if (res.success) {
          toast.info(res.message || `Account ${action}d successfully`);
          fetchUsers();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || `Failed to ${action} user`);
      }
    }
  };

  const handleRoleChange = async (id, name, newRole) => {
    if (window.confirm(`Are you sure you want to change ${name}'s role to ${newRole.toUpperCase()}?`)) {
      try {
        const res = await adminService.updateUserRole(id, newRole);
        if (res.success) {
          toast.success(`Role updated successfully to ${newRole.toUpperCase()}`);
          fetchUsers();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update user role');
      }
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-4 text-dark">User Accounts Management</h2>

      {/* Toolbar */}
      <InputGroup className="mb-4 shadow-sm border border-secondary-subtle" style={{ maxWidth: '400px', borderRadius: '8px', overflow: 'hidden' }}>
        <InputGroup.Text className="bg-white border-0 text-muted"><FaSearch size={14} /></InputGroup.Text>
        <Form.Control
          placeholder="Search users by name, email..."
          value={searchQuery}
          onChange={handleSearch}
          className="border-0 py-2 small"
          style={{ fontSize: '0.85rem' }}
        />
      </InputGroup>

      {loading ? (
        <Loader message="Loading account listings..." />
      ) : users.length === 0 ? (
        <div className="text-center py-5 bg-white border rounded">
          <span style={{ fontSize: '3rem' }}>👥</span>
          <h5 className="fw-bold mt-3">No Users Found</h5>
          <p className="text-muted small">No registration matches your search filter.</p>
        </div>
      ) : (
        <>
          <Table responsive hover className="align-middle bg-white border shadow-sm rounded">
            <thead>
              <tr className="table-light small text-uppercase text-secondary fw-bold">
                <th>Name</th>
                <th>Email</th>
                <th>Joined Date</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id}>
                  <td className="fw-bold small">{item.name}</td>
                  <td className="small text-secondary">{item.email}</td>
                  <td className="small text-secondary">{formatDate(item.createdAt)}</td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={item.role}
                      onChange={(e) => handleRoleChange(item._id, item.name, e.target.value)}
                      className="border border-secondary-subtle font-weight-bold"
                      style={{ fontSize: '0.75rem', width: '90px' }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                  </td>
                  <td>
                    {item.isBlocked ? (
                      <Badge bg="danger" className="px-2 py-1 text-uppercase" style={{ fontSize: '0.6rem' }}>Blocked</Badge>
                    ) : (
                      <Badge bg="success" className="px-2 py-1 text-uppercase" style={{ fontSize: '0.6rem' }}>Active</Badge>
                    )}
                  </td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant={item.isBlocked ? 'outline-success' : 'outline-danger'}
                      onClick={() => handleToggleBlock(item._id, item.name, item.isBlocked)}
                      className="d-inline-flex align-items-center gap-1 small py-1 px-3"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {item.isBlocked ? (
                        <><FaCheck size={10} /> Activate</>
                      ) : (
                        <><FaBan size={10} /> Block</>
                      )}
                    </Button>
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
    </div>
  );
};

export default ManageUsers;
