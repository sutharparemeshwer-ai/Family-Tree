import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import AddMemberForm from '../components/AddMemberForm';
import api from '../utils/api'; // Import the api utility
import './Tree.css';

// Simple Plus Icon
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// Reusable Member Card Component
const MemberCard = ({ member, serverUrl, onAddRelative }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <div className="member-card">
      <button className="add-btn" onClick={() => setMenuVisible(!menuVisible)}>
        <PlusIcon />
      </button>
      {menuVisible && (
        <div className="add-menu">
          <button onClick={() => onAddRelative('Father', member.id)}>Add Father</button>
          <button onClick={() => onAddRelative('Mother', member.id)}>Add Mother</button>
          <button onClick={() => onAddRelative('Spouse', member.id)}>Add Spouse</button>
          <button onClick={() => onAddRelative('Child', member.id)}>Add Child</button>
        </div>
      )}
      <img 
        src={member.profile_img_url ? `${serverUrl}${member.profile_img_url}` : 'https://via.placeholder.com/120'} 
        alt={`${member.first_name} ${member.last_name}`}
        className="member-card-img"
      />
      <h2 className="member-card-name">{member.first_name} {member.last_name}</h2>
      {member.nickname && <p className="member-card-nickname">({member.nickname})</p>}
    </div>
  );
};


const Tree = () => {
  const [user, setUser] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [relationType, setRelationType] = useState('');
  const [relativeToId, setRelativeToId] = useState(null); // ID of the member to whom we are adding a relative
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState('');

  const serverUrl = 'http://localhost:5000';

  // Function to fetch family members
  const fetchFamilyMembers = useCallback(async () => {
    setLoadingMembers(true);
    setMembersError('');
    try {
      const response = await api.get('/members');
      setFamilyMembers(response.data);
    } catch (err) {
      console.error('Error fetching family members:', err);
      setMembersError('Failed to load family members.');
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  // Function to create self member if not exists
  const createSelfIfNotExist = useCallback(async (currentUser) => {
    if (!currentUser) return;

    // Check if a root member already exists for this user
    const rootMemberExists = familyMembers.some(member => 
      member.tree_owner_id === currentUser.id && !member.father_id && !member.mother_id
    );

    if (!rootMemberExists) {
      try {
        await api.post('/members/self');
        fetchFamilyMembers(); // Re-fetch after creating self
      } catch (err) {
        console.error('Error creating self member:', err);
        setMembersError('Failed to create your root family member.');
      }
    }
  }, [familyMembers, fetchFamilyMembers]); // Depend on familyMembers to re-run if it changes

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const currentUser = JSON.parse(storedUser);
      setUser(currentUser);
      fetchFamilyMembers(); // Fetch members once user is loaded
    }
  }, [fetchFamilyMembers]);

  useEffect(() => {
    if (user && !loadingMembers && !membersError) {
      createSelfIfNotExist(user);
    }
  }, [user, loadingMembers, membersError, createSelfIfNotExist]);


  const handleAddRelative = (type, targetMemberId) => {
    setRelationType(type);
    setRelativeToId(targetMemberId); // Set the ID of the member whose '+' was clicked
    setModalOpen(true);
  };

  const handleMemberAdded = () => {
    setModalOpen(false); // Close modal
    fetchFamilyMembers(); // Re-fetch members to update the list
  };

  // Find the main user's card (the one logged in)
  // This should be the root of the tree, which is the member whose tree_owner_id matches user.id
  // and who has no parents (father_id and mother_id are null).
  const mainUserMember = familyMembers.find(member => 
    member.tree_owner_id === user?.id && !member.father_id && !member.mother_id
  );

  // Find the father of the main user
  const fatherOfMainUser = mainUserMember && mainUserMember.father_id 
    ? familyMembers.find(member => member.id === mainUserMember.father_id)
    : null;

  // Find the mother of the main user
  const motherOfMainUser = mainUserMember && mainUserMember.mother_id 
    ? familyMembers.find(member => member.id === mainUserMember.mother_id)
    : null;

  // Find the spouse of the main user
  const spouseOfMainUser = mainUserMember && mainUserMember.spouse_id 
    ? familyMembers.find(member => member.id === mainUserMember.spouse_id)
    : null;

  return (
    <div className="tree-page-container">
      <Navbar />
      <div className="tree-content">
        {loadingMembers && <p>Loading family members...</p>}
        {membersError && <p className="error-message">{membersError}</p>}
        
        {!loadingMembers && !membersError && (
          <div className="tree-visualization">
            {mainUserMember ? (
              <>
                {/* Parents Row */}
                {(fatherOfMainUser || motherOfMainUser) && (
                  <>
                    <div className="generation-row parents-row">
                      {fatherOfMainUser && (
                        <MemberCard 
                          member={fatherOfMainUser} 
                          serverUrl={serverUrl} 
                          onAddRelative={handleAddRelative} 
                        />
                      )}
                      {motherOfMainUser && (
                        <MemberCard 
                          member={motherOfMainUser} 
                          serverUrl={serverUrl} 
                          onAddRelative={handleAddRelative} 
                        />
                      )}
                    </div>
                    <div className="connection-line vertical"></div>
                  </>
                )}

                {/* User and Spouse Row */}
                <div className="generation-row user-and-spouse-row">
                  <MemberCard 
                    member={mainUserMember} 
                    serverUrl={serverUrl} 
                    onAddRelative={handleAddRelative} 
                  />
                  {spouseOfMainUser && (
                    <>
                      <div className="connection-line horizontal"></div>
                      <MemberCard 
                        member={spouseOfMainUser} 
                        serverUrl={serverUrl} 
                        onAddRelative={handleAddRelative} 
                      />
                    </>
                  )}
                </div>
              </>
            ) : (
              // This case should ideally not be reached if createSelfIfNotExist works
              <p>No root member found. Attempting to create...</p>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <AddMemberForm 
          relationType={relationType} 
          onCancel={() => setModalOpen(false)}
          relativeToId={relativeToId} // Pass the ID of the member whose '+' was clicked
          onMemberAdded={handleMemberAdded} 
        />
      </Modal>
    </div>
  );
};

export default Tree;
