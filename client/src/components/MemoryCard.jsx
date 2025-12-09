import React from 'react';
import './MemoryCard.css';

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const MemoryCard = ({ memory }) => {
  const serverUrl = 'http://localhost:5000';
  const firstFile = memory.files && memory.files[0];

  return (
    <div className="memory-card">
      {firstFile ? (
        <div className="memory-card-media">
          {firstFile.type === 'image' ? (
            <img src={`${serverUrl}${firstFile.url}`} alt={memory.title} />
          ) : (
            <video controls>
              <source src={`${serverUrl}${firstFile.url}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ) : (
        <div className="memory-card-media no-media-placeholder">
          <ImageIcon />
          <span>No Media</span>
        </div>
      )}
      <div className="memory-card-content">
        <h4 className="memory-card-title">{memory.title}</h4>
        <p className="memory-card-description">{memory.description}</p>
        <p className="memory-card-date">
          {new Date(memory.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default MemoryCard;
