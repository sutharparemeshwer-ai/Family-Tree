import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactFlow, { 
  Controls, 
  Background, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import api, { SERVER_URL, API_URL } from '../utils/api';
import 'reactflow/dist/style.css';

import Modal from '../components/Modal';
import AddMemberForm from '../components/AddMemberForm';
import FamilyNode from '../components/FamilyNode';
import ConfirmationModal from '../components/ConfirmationModal';
import { getLayoutedElements } from '../utils/treeLayout';
import './Tree.css'; 
import './AuthShared.css'; // Import Auth styles
import '../components/Navbar.css'; // Import Navbar styles

const nodeTypes = {
  familyMember: FamilyNode,
};

// Internal component for shared tree visualization
const SharedTreeVisualizer = ({ familyMembers, serverUrl, onAddRelative, onEdit, onDelete, permission }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (familyMembers.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(familyMembers);

      const nodesWithData = layoutedNodes.map((node) => {
        if (node.type === 'familyMember') {
          return {
            ...node,
            data: { 
              ...node.data, 
              serverUrl,
              // Only pass handlers if permission is 'edit'
              onAddRelative: permission === 'edit' ? onAddRelative : undefined,
              onEdit: permission === 'edit' ? onEdit : undefined,
              onDelete: permission === 'edit' ? onDelete : undefined,
            },
          };
        }
        return node;
      });

      setNodes(nodesWithData);
      setEdges(layoutedEdges);
      setTimeout(() => fitView({ padding: 0.2 }), 50);
    }
  }, [familyMembers, serverUrl, onAddRelative, onEdit, onDelete, permission, setNodes, setEdges, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.1}
      attributionPosition="bottom-right"
      nodesDraggable={false} 
    >
      <Controls />
      <MiniMap nodeStrokeColor={(n) => {
        if (n.type === 'familyMember') return '#4CAF50';
        return '#eee';
      }} />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  );
};

const SharedTree = () => {
  const { token } = useParams();
  
  // State for Tree
  const [familyMembers, setFamilyMembers] = useState([]);
  const [permission, setPermission] = useState('view'); 
  const [ownerName, setOwnerName] = useState('');
  const [treeLabel, setTreeLabel] = useState('');

  // State for Guest Access
  const [isVerified, setIsVerified] = useState(false); 
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '' });
  const [showGuestLogin, setShowGuestLogin] = useState(false);
  const [verifying, setVerifying] = useState(true);

  // State for UI
  const [modalOpen, setModalOpen] = useState(false);
  const [relationType, setRelationType] = useState('');
  const [relativeToId, setRelativeToId] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const serverUrl = SERVER_URL;

  // 1. Initial Check: Verify Token & Check Session
  useEffect(() => {
    const checkToken = async () => {
      setVerifying(true);
      try {
        const res = await api.get(`/share/verify/${token}`);
        if (res.data.valid) {
          setPermission(res.data.permission);
          setOwnerName(res.data.ownerName);
          setTreeLabel(res.data.label);

          if (res.data.permission === 'edit') {
            const storedGuest = sessionStorage.getItem(`guest_info_${token}`);
            if (storedGuest) {
              setGuestInfo(JSON.parse(storedGuest));
              setIsVerified(true);
              fetchTreeData();
            } else {
              setShowGuestLogin(true); 
            }
          } else {
            setIsVerified(true);
            fetchTreeData();
          }
        }
      } catch (err) {
        setError('This link is invalid or has expired.');
      } finally {
        setVerifying(false);
      }
    };
    checkToken();
  }, [token]);

  const fetchTreeData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/share/${token}`);
      setFamilyMembers(response.data.members);
    } catch (err) {
      setError('Failed to load tree data.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 200); // 0.2 seconds
      return () => clearTimeout(timer);
    }
  }, [successMessage]);


  const handleGuestLoginSubmit = (e) => {
    e.preventDefault();
    if (!guestInfo.name) return;
    sessionStorage.setItem(`guest_info_${token}`, JSON.stringify(guestInfo));
    setIsVerified(true);
    setShowGuestLogin(false);
    fetchTreeData();
  };

  // --- Handlers ---

  const handleAddRelative = useCallback((type, targetMemberId) => {
    if (permission !== 'edit') return;
    setRelationType(type);
    setRelativeToId(targetMemberId);
    setEditingMember(null);
    setModalOpen(true);
  }, [permission]);

  const handleEditMember = useCallback((member) => {
    if (permission !== 'edit') return;
    setEditingMember(member);
    setModalOpen(true);
  }, [permission]);

  const handleDeleteRequest = useCallback((memberId) => {
    if (permission !== 'edit') return;
    setMemberToDelete(memberId);
    setDeleteModalOpen(true);
  }, [permission]);

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    try {
        await api.delete(`/share/${token}/members/${memberToDelete}`, {
            headers: {
                'X-Guest-Name': guestInfo.name,
                'X-Guest-Email': guestInfo.email
            }
        });
        setSuccessMessage('Member deleted successfully.');
        setDeleteModalOpen(false);
        setMemberToDelete(null);
        await fetchTreeData();
    } catch (err) {
        console.error('Delete failed:', err);
        setError('Failed to delete member.');
        setDeleteModalOpen(false);
    }
  };

  const handleFormSubmit = async (message) => {
    setModalOpen(false);
    setSuccessMessage(message || 'Operation successful!');
    await fetchTreeData();
  };

  // Render: Loading / Error
  if (verifying) return <div className="loading-overlay">Verifying Link...</div>;
  if (error) return (
    <div className="error-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ color: '#ef5350' }}>Link Error</h2>
      <p>{error}</p>
      <Link to="/" style={{ color: '#4CAF50' }}>Return Home</Link>
    </div>
  );

  // Render: Guest Login Gate
  if (showGuestLogin && !isVerified) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Welcome</h2>
            <p className="auth-subtitle">
              Invited by <strong>{ownerName}</strong>
            </p>
            {treeLabel && <p className="auth-subtitle" style={{marginTop: '0.5rem', fontSize: '0.9rem', color: '#666'}}>"{treeLabel}"</p>}
          </div>
          
          <form className="auth-form" onSubmit={handleGuestLoginSubmit}>
            <div className="input-group">
              <div className="input-field active">
                <input 
                  type="text" 
                  required 
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                  id="guest-name"
                />
                <label htmlFor="guest-name">Your Name</label>
              </div>

              <div className="input-field active">
                <input 
                  type="email" 
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                  id="guest-email"
                />
                <label htmlFor="guest-email">Your Email (Optional)</label>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              Access Family Tree
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render: Tree View
  return (
    <div className="tree-page-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="navbar-brand-link">FamilyTree</Link>
        </div>
        <div className="navbar-user" style={{ cursor: 'default' }}>
           <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00695c', fontWeight: 'bold' }}>
             {guestInfo.name ? guestInfo.name.charAt(0).toUpperCase() : 'G'}
           </div>
           <div className="user-details">
             <span className="user-name">{guestInfo.name || 'Guest'}</span>
             <span className="user-email" style={{ fontSize: '0.75rem', color: '#888' }}>
               {permission === 'edit' ? 'Editor Access' : 'View Only'}
             </span>
           </div>
        </div>
      </nav>

      <div className="tree-content" style={{ height: 'calc(100vh - 80px)', width: '100%' }}>
        {loading && <div className="loading-overlay">Loading shared tree...</div>}
        {successMessage && <div className="success-toast">{successMessage}</div>}

        {!loading && (
           <div style={{ width: '100%', height: '100%' }}>
             <ReactFlowProvider>
               <SharedTreeVisualizer 
                 familyMembers={familyMembers}
                 serverUrl={serverUrl}
                 onAddRelative={handleAddRelative}
                 onEdit={handleEditMember}
                 onDelete={handleDeleteRequest}
                 permission={permission}
               />
             </ReactFlowProvider>
           </div>
        )}
      </div>

      {permission === 'edit' && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
           <AddMemberForm
              relationType={relationType}
              relativeToId={relativeToId}
              editingMember={editingMember}
              onCancel={() => setModalOpen(false)}
              onMemberAdded={handleFormSubmit}
              customEndpoint={`${API_URL}/share/${token}/members${editingMember ? `/${editingMember.id}` : ''}`}
              customHeaders={{
                'X-Guest-Name': guestInfo.name,
                'X-Guest-Email': guestInfo.email
              }}
           />
        </Modal>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Member?"
        message="Are you sure you want to delete this family member? This action is logged."
      />
    </div>
  );
};

export default SharedTree;

