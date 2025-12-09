import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MembersSidebar from '../components/MembersSidebar';
import MemoryGallery from '../components/MemoryGallery';
import MemoryFormModal from '../components/MemoryFormModal';
import './Memories.css';

const Memories = () => {
  const { memberId: urlMemberId } = useParams(); // Rename to avoid confusion
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshGallery, setRefreshGallery] = useState(false);

  const handleMembersLoad = useCallback((loadedMembers) => {
    setMembers(loadedMembers);
    // If no member is selected via URL, select the first one by default
    if (!urlMemberId && loadedMembers.length > 0) {
      navigate(`/memories/${loadedMembers[0].id}`);
    }
  }, [urlMemberId, navigate]);

  useEffect(() => {
    if (urlMemberId && members.length > 0) {
      const id = parseInt(urlMemberId, 10);
      const member = members.find(m => m.id === id);
      setSelectedMember(member);
    } else {
      setSelectedMember(null);
    }
  }, [urlMemberId, members]);

  const handleMemberSelect = (id) => {
    navigate(`/memories/${id}`);
  };

  const handleMemoryAdded = () => {
    setRefreshGallery(prev => !prev); // Toggle to trigger refresh
  };

  return (
    <div className="memories-page-container">
      <Navbar />
      <div className="memories-content">
        <MembersSidebar
          selectedMemberId={parseInt(urlMemberId, 10)} // Pass parsed ID
          onMemberSelect={handleMemberSelect}
          onMembersLoad={handleMembersLoad}
        />
        <main className="memory-gallery-main">
            {urlMemberId ? (
                <MemoryGallery
                    key={refreshGallery} // Force re-render on change
                    memberId={parseInt(urlMemberId, 10)}
                    memberName={`${selectedMember?.first_name || ''} ${selectedMember?.last_name || ''}`}
                    onAddMemory={() => setIsModalOpen(true)}
                />
            ) : (
                <div className="memory-card-placeholder" style={{gridColumn: '1 / -1'}}>
                    <p>Select a family member to see their memories.</p>
                </div>
            )}
        </main>
      </div>
      <MemoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memberId={parseInt(urlMemberId, 10)}
        onMemoryAdded={handleMemoryAdded}
      />
    </div>
  );
};

export default Memories;
