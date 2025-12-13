import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  addEdge,
  ConnectionLineType
} from 'reactflow';
import 'reactflow/dist/style.css';

import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import AddMemberForm from '../components/AddMemberForm';
import FamilyNode from '../components/FamilyNode';
import api from '../utils/api';
import { getLayoutedElements } from '../utils/treeLayout';
import './Tree.css';

const nodeTypes = {
  familyMember: FamilyNode,
};

const Tree = () => {
  const [user, setUser] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [relationType, setRelationType] = useState('');
  const [relativeToId, setRelativeToId] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const serverUrl = 'http://localhost:5000';

  // Fetch Family Members
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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchFamilyMembers();
    }
  }, [fetchFamilyMembers]);

  // Handle Add Relative - Modal Open
  const handleAddRelative = useCallback((type, targetMemberId) => {
    setRelationType(type);
    setRelativeToId(targetMemberId);
    setModalOpen(true);
    setSuccessMessage('');
  }, []);

  // Compute Layout when familyMembers change
  useEffect(() => {
    if (familyMembers.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(familyMembers);

      // Inject callbacks and config into node data
      const nodesWithData = layoutedNodes.map((node) => {
        if (node.type === 'familyMember') {
          return {
            ...node,
            data: { 
              ...node.data, 
              serverUrl, 
              onAddRelative: handleAddRelative 
            },
          };
        }
        return node;
      });

      setNodes(nodesWithData);
      setEdges(layoutedEdges);
    } else {
        setNodes([]);
        setEdges([]);
    }
  }, [familyMembers, handleAddRelative, setNodes, setEdges]);


  const handleAddSelf = () => {
    setRelationType('Self');
    setRelativeToId(null);
    setModalOpen(true);
    setSuccessMessage('');
  };

  const handleMemberAdded = async (message) => {
    setModalOpen(false);
    setSuccessMessage(message || 'Member added successfully!');
    // Small delay to ensure backend update
    await new Promise(resolve => setTimeout(resolve, 300));
    await fetchFamilyMembers();
  };

  return (
    <div className="tree-page-container">
      <Navbar />
      <div className="tree-content" style={{ height: 'calc(100vh - 80px)', width: '100%' }}>
        {loadingMembers && <div className="loading-overlay">Loading family tree...</div>}
        {membersError && <p className="error-message">{membersError}</p>}
        {successMessage && <div className="success-toast">{successMessage}</div>}
        
        {!loadingMembers && !membersError && (
          <>
            {familyMembers.length === 0 ? (
              <div className="add-self-prompt">
                <p>Start your family tree!</p>
                <button className="hero-cta-btn" onClick={handleAddSelf}>Add Myself</button>
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={nodeTypes}
                  fitView
                  minZoom={0.1}
                  attributionPosition="bottom-right"
                >
                  <Controls />
                  <MiniMap nodeStrokeColor={(n) => {
                    if (n.type === 'familyMember') return '#4CAF50';
                    return '#eee';
                  }} />
                  <Background color="#aaa" gap={16} />
                </ReactFlow>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <AddMemberForm
          relationType={relationType}
          onCancel={() => setModalOpen(false)}
          relativeToId={relativeToId}
          onMemberAdded={handleMemberAdded}
        />
      </Modal>
    </div>
  );
};

export default Tree;
