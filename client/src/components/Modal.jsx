import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, children, disableClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={disableClose ? null : onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {!disableClose && (
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
