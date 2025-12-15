import React, { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import './FamilyNode.css';

// Icons for the "Add Relative" menu
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const FatherIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1-12 0c0-1.5.7-3.1 2-4.5C7.3 2.1 8.8 2 10 2s3 0.1 4 1.5c1.3 1.4 2 3 2 4.5z"></path><path d="M22 6s-2 2-6 2c-4 0-6-2-6-2"></path><path d="M2 11c0 2 2 4 6 4s6-2 6-4"></path></svg>);
const MotherIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.5c4-2 7-5 7-10s-3-9-7-9-7 4-7 9 3 8 7 10z"></path><path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M12 14c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3z"></path></svg>);
const SiblingIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 11V3H7v8"></path><path d="M22 17H2"></path><path d="M2 17a3 3 0 1 1 6 0 3 3 0 0 1-6 0z"></path><path d="M12 17a3 3 0 1 1 6 0 3 3 0 0 1-6 0z"></path><path d="M17 17a3 3 0 1 1 6 0 3 3 0 0 1-6 0z"></path></svg>);
const SpouseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>);
const ChildIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H7"></path><path d="M12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path><path d="M10 12h4"></path><path d="M9 16h6"></path><path d="M9 20h6"></path></svg>);


const FamilyNode = ({ data }) => {
  const { member, serverUrl, onAddRelative, isHighlighted } = data;
  const [menuVisible, setMenuVisible] = useState(false);

  const createAnonymousAvatar = (name) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C2700', '#00BCD4', '#8BC34A', '#FFC107', '#607D8B', '#795548'];
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const bgColor = colors[colorIndex];

    return `data:image/svg+xml;base64,${btoa(`
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="60" fill="${bgColor}"/>
        <text x="60" y="75" font-family="Poppins, sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`;
  };

  const hasProfileImage = !!member.profile_img_url;
  const imageSrc = hasProfileImage ? `${serverUrl}${member.profile_img_url}` : createAnonymousAvatar(`${member.first_name} ${member.last_name || ''}`);

  return (
    <div className={`family-node ${isHighlighted ? 'isHighlighted' : ''}`}>
      {/* Input Handle (from Parents) */}
      <Handle type="target" position={Position.Top} className="react-flow__handle-top" />

      <button className="node-add-btn" onClick={(e) => {
        e.stopPropagation();
        setMenuVisible(!menuVisible);
      }}>
        <PlusIcon />
      </button>

      {menuVisible && (
        <div className="node-add-menu" onMouseLeave={() => setMenuVisible(false)}>
          <button onClick={() => { onAddRelative('Father', member.id); setMenuVisible(false); }}><FatherIcon /> Add Father</button>
          <button onClick={() => { onAddRelative('Mother', member.id); setMenuVisible(false); }}><MotherIcon /> Add Mother</button>
          <button onClick={() => { onAddRelative('Spouse', member.id); setMenuVisible(false); }}><SpouseIcon /> Add Spouse</button>
          <button onClick={() => { onAddRelative('Child', member.id); setMenuVisible(false); }}><ChildIcon /> Add Child</button>
          {/* Sibling logic can be more complex, might need another approach or simplify for now */}
          <button onClick={() => { onAddRelative('Sibling', member.id); setMenuVisible(false); }}><SiblingIcon /> Add Sibling</button>
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
      {/* Assuming member has birth_date and death_date fields */}
      {(member.birth_date || member.death_date) && (
        <p className="node-dates">
          {member.birth_date ? new Date(member.birth_date).getFullYear() : ''} 
          {member.birth_date && member.death_date ? ' - ' : ''}
          {member.death_date ? new Date(member.death_date).getFullYear() : ''}
        </p>
      )}

      {/* Output Handle (to Children) */}
      <Handle type="source" position={Position.Bottom} className="react-flow__handle-bottom" />
    </div>
  );
};

export default memo(FamilyNode);