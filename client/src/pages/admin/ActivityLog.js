import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge } from 'react-bootstrap';
import { FaHistory, FaUserPlus, FaCartPlus, FaInfoCircle } from 'react-icons/fa';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/helpers';
import * as adminService from '../../services/adminService';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await adminService.getActivityLog();
        if (res.success) {
          setActivities(res.activities || []);
        }
      } catch (error) {
        console.error('Error fetching activity log:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'registration':
        return <FaUserPlus className="text-success" />;
      case 'order':
        return <FaCartPlus className="text-primary" />;
      default:
        return <FaInfoCircle className="text-secondary" />;
    }
  };

  if (loading) return <Loader message="Compiling activity tracker logs..." />;

  return (
    <div className="fade-in">
      <h2 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
        <FaHistory size={24} className="text-secondary" /> Activity Log
      </h2>

      {activities.length === 0 ? (
        <div className="text-center py-5 bg-white border rounded">
          <span style={{ fontSize: '3rem' }}>📋</span>
          <h5 className="fw-bold mt-3">No Activity Logged</h5>
          <p className="text-muted small">All operational updates will trace here.</p>
        </div>
      ) : (
        <Card className="border shadow-sm p-4 bg-white">
          <Card.Body className="p-0">
            <p className="text-secondary small mb-4">
              Real-time trace log tracking student signups and checkout payments.
            </p>

            <Table responsive hover className="align-middle mb-0">
              <thead>
                <tr className="table-light small text-uppercase text-secondary fw-bold">
                  <th>Log Type</th>
                  <th>Activity Event Description</th>
                  <th>Time Stamp</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center gap-2 small fw-semibold text-capitalize">
                        {getActivityIcon(act.type)}
                        <span>{act.type}</span>
                      </div>
                    </td>
                    <td className="small fw-medium text-dark">{act.message}</td>
                    <td className="small text-secondary">{formatDate(act.date)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ActivityLog;
