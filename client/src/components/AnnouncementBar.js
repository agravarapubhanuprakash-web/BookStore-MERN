import React, { useState, useEffect } from 'react';
import { Alert, Container } from 'react-bootstrap';
import api from '../services/api';

const AnnouncementBar = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const fetchActiveAnnouncement = async () => {
      try {
        const response = await api.get('/announcements/active');
        if (response.data.success && response.data.announcements && response.data.announcements.length > 0) {
          // Display the most recent active announcement
          setAnnouncement(response.data.announcements[0]);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error.message);
      }
    };

    fetchActiveAnnouncement();
  }, []);

  if (!announcement || !show) return null;

  return (
    <Alert
      variant={announcement.type || 'info'}
      onClose={() => setShow(false)}
      dismissible
      className="m-0 rounded-0 border-0 text-center py-2 announcement-bar"
      style={{ zIndex: 1000 }}
    >
      <Container className="d-flex justify-content-center align-items-center gap-2">
        <span className="fw-semibold">{announcement.title}:</span>
        <span className="small">{announcement.message}</span>
      </Container>
    </Alert>
  );
};

export default AnnouncementBar;
