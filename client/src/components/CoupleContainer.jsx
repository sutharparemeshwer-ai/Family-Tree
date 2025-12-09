import React from 'react';
import MemberCard from './MemberCard';
import './CoupleContainer.css';

const CoupleContainer = ({ member1, member2, serverUrl, onAddRelative }) => {
  return (
    <div className="couple-container">
      {member1 && (
        <MemberCard
          member={member1}
          serverUrl={serverUrl}
          onAddRelative={onAddRelative}
        />
      )}
      {member2 && (
        <MemberCard
          member={member2}
          serverUrl={serverUrl}
          onAddRelative={onAddRelative}
        />
      )}
    </div>
  );
};

export default CoupleContainer;
