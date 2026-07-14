import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { FaBook, FaUsers, FaShoppingCart, FaRupeeSign, FaHourglassHalf, FaBookmark } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';
import * as adminService from '../../services/adminService';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) return <Loader message="Compiling dashboard analytics..." />;

  // Prepare chart data for Monthly Revenue (last 6 months)
  const revenueChartData = {
    labels: stats?.monthlyRevenue?.map((r) => r.month) || [],
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: stats?.monthlyRevenue?.map((r) => r.revenue) || [],
        backgroundColor: '#2563eb', // Bookstore primary blue
        borderRadius: 6,
      },
    ],
  };

  // Prepare chart data for Category Book Distribution
  const categoryChartData = {
    labels: stats?.categoryDistribution?.map((c) => c.name) || [],
    datasets: [
      {
        label: 'Books per Category',
        data: stats?.categoryDistribution?.map((c) => c.count) || [],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4',
          '#14b8a6',
          '#84cc16',
          '#f43f5e',
        ],
        borderWidth: 1,
      },
    ],
  };

  const statCards = [
    { label: 'Total Books', value: stats?.totalBooks || 0, icon: FaBook, color: 'border-primary text-primary bg-primary-subtle' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: FaUsers, color: 'border-success text-success bg-success-subtle' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: FaShoppingCart, color: 'border-info text-info bg-info-subtle' },
    { label: 'Total Revenue', value: formatPrice(stats?.revenue || 0), icon: FaRupeeSign, color: 'border-warning text-warning bg-warning-subtle' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: FaHourglassHalf, color: 'border-danger text-danger bg-danger-subtle' },
    { label: 'Reservations', value: stats?.activeReservations || 0, icon: FaBookmark, color: 'border-purple text-purple bg-purple-subtle' }, // purple color custom
  ];

  return (
    <div>
      <h2 className="fw-bold mb-4 text-dark">Admin Dashboard</h2>

      {/* Stats Cards Row */}
      <Row className="g-4 mb-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Col key={idx} xs={12} sm={6} md={4} lg={2}>
              <Card className={`border-start border-4 ${card.color} h-100 shadow-sm`}>
                <Card.Body className="d-flex align-items-center p-3 justify-content-between">
                  <div>
                    <div className="small text-secondary fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>{card.label}</div>
                    <h5 className="fw-bold text-dark mb-0 mt-1">{card.value}</h5>
                  </div>
                  <div className="fs-4"><Icon /></div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Analytics Charts Row */}
      <Row className="gy-4 mb-4">
        {/* Monthly Revenue Bar Chart */}
        <Col lg={7}>
          <Card className="border shadow-sm p-4 bg-white">
            <Card.Body className="p-0">
              <h5 className="fw-bold mb-3">Revenue Report</h5>
              <div style={{ minHeight: '250px' }}>
                <Bar
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Category distribution Pie Chart */}
        <Col lg={5}>
          <Card className="border shadow-sm p-4 bg-white">
            <Card.Body className="p-0">
              <h5 className="fw-bold mb-3">Books By Category</h5>
              <div style={{ minHeight: '250px' }} className="d-flex justify-content-center">
                <Doughnut
                  data={categoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Card className="border shadow-sm bg-white">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Recent Orders</h5>
            <Button as={Link} to="/admin/orders" size="sm" variant="outline-primary">
              View All Orders
            </Button>
          </div>
          
          <Table responsive hover className="align-middle mb-0">
            <thead>
              <tr className="table-light small text-uppercase text-secondary fw-bold">
                <th>Invoice</th>
                <th>Customer</th>
                <th>Placed On</th>
                <th>Total Price</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id}>
                  <td className="fw-bold small">{order.invoiceNumber}</td>
                  <td className="small">{order.user?.name || 'Guest User'}</td>
                  <td className="small text-secondary">{formatDate(order.createdAt)}</td>
                  <td className="fw-bold small text-primary">{formatPrice(order.totalPrice)}</td>
                  <td>
                    <Badge bg={getStatusColor(order.orderStatus)} className="text-uppercase" style={{ fontSize: '0.6rem' }}>
                      {order.orderStatus}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Link to={`/orders/${order._id}`} className="btn btn-light btn-sm text-primary fw-medium" style={{ fontSize: '0.75rem' }}>
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
