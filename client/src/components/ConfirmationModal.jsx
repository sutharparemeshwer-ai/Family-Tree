import React from 'react';
import Modal from './Modal';
import './ConfirmationModal.css';

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="confirmation-modal-content">
        <div className="confirmation-icon">
          <TrashIcon />
        </div>
        <h3 className="confirmation-title">{title || 'Are you sure?'}</h3>
        <p className="confirmation-message">
          {message || 'This action cannot be undone.'}
        </p>
        <div className="confirmation-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
