import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import AddMemberForm from '../components/AddMemberForm';
import MemberCard from '../components/MemberCard'; // Import MemberCard
import CoupleContainer from '../components/CoupleContainer'; // Import CoupleContainer
import api from '../utils/api'; // Import the api utility
import './Tree.css';


const Tree = () => {
  const [user, setUser] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [relationType, setRelationType] = useState('');
  const [relativeToId, setRelativeToId] = useState(null); // ID of the member to whom we are adding a relative
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State for success message

  const serverUrl = 'http://localhost:5000';

  // Function to fetch family members
  const fetchFamilyMembers = useCallback(async () => {
    setLoadingMembers(true);
    setMembersError('');
    try {
      const response = await api.get('/members');
      setFamilyMembers(response.data);
      return response.data; // Return data for immediate use
    } catch (err) {
      console.error('Error fetching family members:', err);
      setMembersError('Failed to load family members.');
      return [];
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const currentUser = JSON.parse(storedUser);
      setUser(currentUser);
      fetchFamilyMembers(); // Fetch members once user is loaded
    }
  }, [fetchFamilyMembers]);

  // Auto-hide success message after 0.5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);


  const handleAddRelative = (type, targetMemberId) => {
    // When adding a sibling to a parent, we need to find the grandparent
    // However, the backend handles this logic, so we just pass the correct type
    setRelationType(type);
    setRelativeToId(targetMemberId);
    setModalOpen(true);
    setSuccessMessage('');
  };

  const handleAddSelf = () => {
    setRelationType('Self');
    setRelativeToId(null); // No relative to link to when adding self
    setModalOpen(true);
    setSuccessMessage(''); // Clear success message when opening modal
  };

  const handleMemberAdded = async (message) => {
    setModalOpen(false); // Close modal
    setSuccessMessage(message || 'Member added successfully!'); // Set success message

    // Small delay to ensure backend has finished updating relationships
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Re-fetch members to update the list
    await fetchFamilyMembers();
  };

  // Helper function to find the logged-in user's member
  const findLoggedInUserMember = () => {
    return familyMembers.find(member =>
      member.tree_owner_id === user?.id &&
      member.first_name === user?.first_name &&
      member.last_name === user?.last_name
    );
  };

  // Helper function to find parent of a member
  const findParent = (memberId, type) => {
    const member = familyMembers.find(m => m.id === memberId);
    if (!member) return null;

    const parentId = type === 'father' ? member.father_id : member.mother_id;
    return parentId ? familyMembers.find(m => m.id === parentId) : null;
  };

  // Helper function to find spouse of a member
  const findSpouse = (memberId) => {
    const member = familyMembers.find(m => m.id === memberId);
    if (member && member.spouse_id) {
      return familyMembers.find(m => m.id === member.spouse_id);
    }
    return null;
  };

  // Helper function to find children of a member
  const findChildren = (memberId) => {
    return familyMembers.filter(member =>
      member.father_id === memberId || member.mother_id === memberId
    );
  };

  // Helper function to find siblings of any member
  const findSiblingsOfMember = (memberToFindSiblingsFor) => {
    if (!memberToFindSiblingsFor) return [];

    const { father_id, mother_id } = memberToFindSiblingsFor;

    // A person must have at least one parent to have siblings.
    if (!father_id && !mother_id) {
      return [];
    }

    // Siblings are defined as having the exact same father and mother IDs.
    return familyMembers.filter(member =>
      member.id !== memberToFindSiblingsFor.id &&
      member.tree_owner_id === user?.id &&
      member.father_id === father_id &&
      member.mother_id === mother_id
    );
  };

  // Helper function to find siblings of the logged-in user
  const findSiblings = (mainUserMember) => {
    return findSiblingsOfMember(mainUserMember);
  };

  // This function is no longer needed, the logic is now inline.
  // const findOtherMembers = ...

  const loggedInUserMember = findLoggedInUserMember();
  const father = loggedInUserMember ? findParent(loggedInUserMember.id, 'father') : null;
  const mother = loggedInUserMember ? findParent(loggedInUserMember.id, 'mother') : null;

  // Find grandparents
  const paternalGrandfather = father ? findParent(father.id, 'father') : null;
  const paternalGrandmother = father ? findParent(father.id, 'mother') : null;
  const maternalGrandfather = mother ? findParent(mother.id, 'father') : null;
  const maternalGrandmother = mother ? findParent(mother.id, 'mother') : null;

  const spouse = loggedInUserMember ? findSpouse(loggedInUserMember.id) : null;
  const children = loggedInUserMember ? findChildren(loggedInUserMember.id) : [];
  
  // Find siblings of parents (uncles/aunts)
  const fatherSiblings = father ? findSiblingsOfMember(father) : [];
  const motherSiblings = mother ? findSiblingsOfMember(mother) : [];
  
  // Find user's siblings
  const allSiblings = loggedInUserMember ? findSiblings(loggedInUserMember) : [];
  
  // Separate user's siblings into brothers and sisters
  const brothers = allSiblings.filter(sibling => sibling.gender === 'male');
  const sisters = allSiblings.filter(sibling => sibling.gender === 'female');
  const siblingsWithoutGender = allSiblings.filter(sibling => !sibling.gender || (sibling.gender !== 'male' && sibling.gender !== 'female'));
  
  // --- START: NEW LOGIC FOR STRICT CATEGORIZATION ---

  // 1. Create a set of all IDs that are explicitly placed in a primary category.
  const categorizedIds = new Set();

  // Add user, spouse, parents, and grandparents
  if (loggedInUserMember) categorizedIds.add(loggedInUserMember.id);
  if (spouse) categorizedIds.add(spouse.id);
  if (father) categorizedIds.add(father.id);
  if (mother) categorizedIds.add(mother.id);
  if (paternalGrandfather) categorizedIds.add(paternalGrandfather.id);
  if (paternalGrandmother) categorizedIds.add(paternalGrandmother.id);
  if (maternalGrandfather) categorizedIds.add(maternalGrandfather.id);
  if (maternalGrandmother) categorizedIds.add(maternalGrandmother.id);

  // Add all children
  children.forEach(child => categorizedIds.add(child.id));

  // Add all siblings (user's and parents')
  allSiblings.forEach(sibling => categorizedIds.add(sibling.id));
  fatherSiblings.forEach(sibling => categorizedIds.add(sibling.id));
  motherSiblings.forEach(sibling => categorizedIds.add(sibling.id));

  // Add spouses of siblings and uncles/aunts, as they are rendered in CoupleContainers
  const allPrimaryMembers = [
    ...allSiblings,
    ...fatherSiblings,
    ...motherSiblings,
  ];
  allPrimaryMembers.forEach(member => {
    const memberSpouse = findSpouse(member.id);
    if (memberSpouse) {
      categorizedIds.add(memberSpouse.id);
    }
  });

  // 2. "Other Members" are now ONLY those not in the categorized set.
  const otherMembers = familyMembers.filter(member => !categorizedIds.has(member.id));

  // --- END: NEW LOGIC ---
  
  const renderedParentIds = new Set();


  return (
    <div className="tree-page-container">
      <Navbar />
      <div className="tree-content">
        {loadingMembers && <p>Loading family members...</p>}
        {membersError && <p className="error-message">{membersError}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>} {/* Display success message */}
        
        {!loadingMembers && !membersError && (
          <div className="tree-visualization">
            {/* If no family members, prompt to add self */}
            {familyMembers.length === 0 && (
              <div className="add-self-prompt">
                <p>You haven't added yourself to the family tree yet.</p>
                <button className="hero-cta-btn" onClick={handleAddSelf}>Add Myself</button>
              </div>
            )}

            {familyMembers.length > 0 && (
              <div className="family-tree">
                {/* Grandparents Row */}
                {(paternalGrandfather || paternalGrandmother || maternalGrandfather || maternalGrandmother) && (
                  <div className="generation-section">
                    <h3 className="generation-title">Grandparents</h3>
                    <div className="generation-row grandparents-row">
                      {/* Paternal Grandparents */}
                      {(paternalGrandfather || paternalGrandmother) && (
                        <CoupleContainer
                          className="paternal-grandparents"
                          member1={paternalGrandfather}
                          member2={paternalGrandmother}
                          serverUrl={serverUrl}
                          onAddRelative={handleAddRelative}
                        />
                      )}
                      {/* Maternal Grandparents */}
                      {(maternalGrandfather || maternalGrandmother) && (
                        <CoupleContainer
                          className="maternal-grandparents"
                          member1={maternalGrandfather}
                          member2={maternalGrandmother}
                          serverUrl={serverUrl}
                          onAddRelative={handleAddRelative}
                        />
                      )}
                    </div>
                    <div className="connection-line vertical"></div>
                  </div>
                )}

                {/* Parents Row */}
                {(father || mother) && (
                  <div className="generation-section">
                    <h3 className="generation-title">Parents</h3>
                    <div className="generation-row parents-row">
                      {(() => {
                        // This set will prevent duplicate renders within this specific row
                        renderedParentIds.clear();
                        return null;
                      })()}

                      {/* Render maternal siblings (mother's side) */}
                      {motherSiblings.map((sibling, index) => {
                        if (renderedParentIds.has(sibling.id)) return null;
                        
                        const spouse = findSpouse(sibling.id);
                        renderedParentIds.add(sibling.id);
                        if (spouse) renderedParentIds.add(spouse.id);

                        return (
                          <React.Fragment key={sibling.id}>
                            <CoupleContainer
                              member1={sibling}
                              member2={spouse}
                              serverUrl={serverUrl}
                              onAddRelative={handleAddRelative}
                            />
                            {index < motherSiblings.length - 1 && <div className="connection-line horizontal"></div>}
                          </React.Fragment>
                        );
                      })}

                      {motherSiblings.length > 0 && <div className="connection-line horizontal"></div>}

                      {/* Explicitly render Father and Mother together */}
                      {(father || mother) && (() => {
                        if (father) renderedParentIds.add(father.id);
                        if (mother) renderedParentIds.add(mother.id);
                        return (
                            <div className="parents-center-card">
                            <CoupleContainer
                                key="parent-couple"
                                member1={father}
                                member2={mother}
                                serverUrl={serverUrl}
                                onAddRelative={handleAddRelative}
                            />
                            </div>
                        );
                      })()}

                      {fatherSiblings.length > 0 && <div className="connection-line horizontal"></div>}

                      {/* Render paternal siblings (father's side) */}
                      {fatherSiblings.map((sibling, index) => {
                        if (renderedParentIds.has(sibling.id)) return null;

                        const spouse = findSpouse(sibling.id);
                        renderedParentIds.add(sibling.id);
                        if (spouse) renderedParentIds.add(spouse.id);
                        
                        return (
                          <React.Fragment key={sibling.id}>
                            <CoupleContainer
                              member1={sibling}
                              member2={spouse}
                              serverUrl={serverUrl}
                              onAddRelative={handleAddRelative}
                            />
                            {index < fatherSiblings.length - 1 && <div className="connection-line horizontal"></div>}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    {(allSiblings.length > 0 || loggedInUserMember) && <div className="connection-line vertical"></div>}
                  </div>
                )}

                {/* User and Siblings Row */}
                {loggedInUserMember && (
                  <div className="generation-section">
                    <h3 className="generation-title">You & Siblings ({allSiblings.length + 1} members)</h3>
                    <div className="generation-row user-siblings-row">
                      {/* Brothers section - Left side */}
                      {brothers.length > 0 && (
                        <div className="siblings-group brothers-group">
                          {brothers.map((brother, index) => (
                            <React.Fragment key={brother.id}>
                              <MemberCard
                                member={brother}
                                serverUrl={serverUrl}
                                onAddRelative={handleAddRelative}
                              />
                              {index < brothers.length - 1 && <div className="connection-line horizontal"></div>}
                            </React.Fragment>
                          ))}
                          <div className="connection-line horizontal siblings-to-user-connector"></div>
                        </div>
                      )}

                      {/* User and Spouse section - Middle container */}
                      <div className="center-card">
                        <CoupleContainer
                          member1={loggedInUserMember}
                          member2={spouse}
                          serverUrl={serverUrl}
                          onAddRelative={handleAddRelative}
                        />
                      </div>

                      {/* Sisters section - Right side */}
                      {sisters.length > 0 && (
                        <div className="siblings-group sisters-group">
                          <div className="connection-line horizontal siblings-to-user-connector"></div>
                          {sisters.map((sister, index) => (
                            <React.Fragment key={sister.id}>
                              <MemberCard
                                member={sister}
                                serverUrl={serverUrl}
                                onAddRelative={handleAddRelative}
                              />
                              {index < sisters.length - 1 && <div className="connection-line horizontal"></div>}
                            </React.Fragment>
                          ))}
                        </div>
                      )}

                      {/* Siblings without gender (fallback) */}
                      {siblingsWithoutGender.length > 0 && (
                        <div className="siblings-group">
                          {brothers.length === 0 && <div className="connection-line horizontal siblings-to-user-connector"></div>}
                          {siblingsWithoutGender.map((sibling, index) => (
                            <React.Fragment key={sibling.id}>
                              <MemberCard
                                member={sibling}
                                serverUrl={serverUrl}
                                onAddRelative={handleAddRelative}
                              />
                              {index < siblingsWithoutGender.length - 1 && <div className="connection-line horizontal"></div>}
                            </React.Fragment>
                          ))}
                          {brothers.length > 0 && <div className="connection-line horizontal siblings-to-user-connector"></div>}
                        </div>
                      )}

                      {/* Show empty state if no siblings */}
                      {allSiblings.length === 0 && (
                        <div className="empty-siblings-placeholder">Add siblings to see them here</div>
                      )}
                    </div>
                    {children.length > 0 && <div className="connection-line vertical"></div>}
                  </div>
                )}

                {/* Children Row */}
                {children.length > 0 && (
                  <div className="generation-section">
                    <h3 className="generation-title">Children</h3>
                    <div className="generation-row children-row">
                      {children.map(child => (
                        <MemberCard
                          key={child.id}
                          member={child}
                          serverUrl={serverUrl}
                          onAddRelative={handleAddRelative}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Family Members */}
                {otherMembers.length > 0 && (
                  <div className="generation-section">
                    <h3 className="generation-title">Other Family Members</h3>
                    <div className="generation-row">
                      {otherMembers.map(member => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          serverUrl={serverUrl}
                          onAddRelative={handleAddRelative}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
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