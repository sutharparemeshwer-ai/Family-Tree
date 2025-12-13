import React, { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import './FamilyNode.css';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const FamilyNode = ({ data }) => {
  const { member, serverUrl, onAddRelative } = data;
  const [menuVisible, setMenuVisible] = useState(false);

  // Helper for anonymous avatar
  const createAnonymousAvatar = (name) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#8BC34A', '#FFC107'];
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const bgColor = colors[colorIndex];

    return `data:image/svg+xml;base64,${btoa(`
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="60" fill="${bgColor}"/>
        <text x="60" y="75" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`;
  };

  const hasProfileImage = !!member.profile_img_url;
  const imageSrc = hasProfileImage ? `${serverUrl}${member.profile_img_url}` : createAnonymousAvatar(`${member.first_name} ${member.last_name || ''}`);

  return (
    <div className="family-node">
      {/* Input Handle (from Parents) */}
      <Handle type="target" position={Position.Top} className="react-flow__handle-top" />

      <button className="node-add-btn" onClick={(e) => {
        e.stopPropagation(); // Prevent node selection logic if any
        setMenuVisible(!menuVisible);
      }}>
        <PlusIcon />
      </button>

      {menuVisible && (
        <div className="node-add-menu" onMouseLeave={() => setMenuVisible(false)}>
          <button onClick={() => onAddRelative('Father', member.id)}>Add Father</button>
          <button onClick={() => onAddRelative('Mother', member.id)}>Add Mother</button>
          <button onClick={() => onAddRelative('Brother', member.id)}>Add Brother</button>
          <button onClick={() => onAddRelative('Sister', member.id)}>Add Sister</button>
          <button onClick={() => onAddRelative('Spouse', member.id)}>Add Spouse</button>
          <button onClick={() => onAddRelative('Child', member.id)}>Add Child</button>
        </div>
      )}

      <div className="node-image-container">
        <img
          src={imageSrc}
          alt={`${member.first_name}`}
          className="node-profile-img"
        />
      </div>
      
      <h3 className="node-name">{member.first_name} {member.last_name}</h3>
      {member.nickname && <p className="node-nickname">({member.nickname})</p>}

      {/* Output Handle (to Children) */}
      <Handle type="source" position={Position.Bottom} className="react-flow__handle-bottom" />
    </div>
  );
};

export default memo(FamilyNode);
