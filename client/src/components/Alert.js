import React from 'react';
import { Alert as BAlert } from 'react-bootstrap';

const Alert = ({ variant = 'info', message, onClose, dismissible = true }) => {
  if (!message) return null;

  return (
    <BAlert variant={variant} onClose={onClose} dismissible={dismissible} className="shadow-sm border-0 my-3">
      {message}
    </BAlert>
  );
};

export default Alert;
