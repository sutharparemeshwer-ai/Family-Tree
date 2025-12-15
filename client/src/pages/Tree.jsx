import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  addEdge,
  ConnectionLineType, // Import ConnectionLineType
  useReactFlow,
  ReactFlowProvider,
  Panel // Import Panel here
} from 'reactflow';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import 'reactflow/dist/style.css';

import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import AddMemberForm from '../components/AddMemberForm';
import ActionBar from '../components/ActionBar';
import ShareModal from '../components/ShareModal';
import FamilyNode from '../components/FamilyNode';
import api from '../utils/api';
import { getLayoutedElements } from '../utils/treeLayout';
import { generateFamilyBook } from '../utils/bookGenerator';
import './Tree.css';

const nodeTypes = {
  familyMember: FamilyNode,
};

// Define default edge options for consistency
const defaultEdgeOptions = {
  animated: true,
  style: { strokeWidth: 2, stroke: '#81c784' },
  type: ConnectionLineType.SmoothStep, // Use smoothStep for elegant connections
  markerEnd: {
    type: 'arrowclosed',
    color: '#81c784',
  },
};

// Internal component to use ReactFlow hooks
const TreeVisualizer = ({ familyMembers, serverUrl, onAddRelative, user }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, setCenter, zoomTo } = useReactFlow();
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);

  // 1. Initial Layout Calculation (Run only when family members change)
  useEffect(() => {
    if (familyMembers.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(familyMembers);

      // Initialize nodes with base data
      const initialNodes = layoutedNodes.map((node) => {
        if (node.type === 'familyMember') {
          return {
            ...node,
            data: { 
              ...node.data, 
              serverUrl, 
              onAddRelative,
              isHighlighted: false // Default
            },
            // Style will be handled by FamilyNode.css now, remove inline style
            style: {} 
          };
        }
        return node;
      });

      setNodes(initialNodes);
      setEdges(layoutedEdges);
      
      // Fit view only on data load
      setTimeout(() => fitView({ padding: 0.2 }), 50);
    } else {
        setNodes([]);
        setEdges([]);
    }
  }, [familyMembers, serverUrl, onAddRelative, setNodes, setEdges, fitView]);

  // 2. Handle Highlighting (Run when highlightedId changes)
  useEffect(() => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.type === 'familyMember') {
          return {
            ...node,
            data: {
              ...node.data,
              isHighlighted: node.id === highlightedId, // Pass highlight status to node data
            },
            // Remove inline style, let CSS handle it
            style: {}, 
          };
        }
        return node;
      })
    );
  }, [highlightedId, setNodes]);

  // Handle Search Input
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      const results = familyMembers.filter(member => 
        `${member.first_name} ${member.last_name || ''}`.toLowerCase().includes(query.toLowerCase()) ||
        (member.nickname && member.nickname.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(results.slice(0, 5)); // Limit to 5
    } else {
      setSearchResults([]);
    }
  };

  // Fly To Member
  const flyToMember = (member) => {
    const node = nodes.find(n => n.id === member.id.toString());
    if (node) {
      // Find the center of the node for precise centering
      const x = node.position.x + (node.width / 2 || 0);
      const y = node.position.y + (node.height / 2 || 0);

      setCenter(x, y, { zoom: 1.5, duration: 800 }); // Smoother and faster fly animation
      setHighlightedId(member.id.toString());
      setSearchQuery('');
      setSearchResults([]);
    }
  };

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
      onPaneClick={() => setHighlightedId(null)} // Clear highlight on click background
      defaultEdgeOptions={defaultEdgeOptions} // Apply default edge options
      connectionLineType={ConnectionLineType.SmoothStep} // Explicitly set connection line type
    >
      <Controls className="react-flow-controls" /> {/* Add class for styling */}
      <MiniMap 
        nodeStrokeColor={(n) => {
          if (n.type === 'familyMember') return 'var(--primary-color)'; // Use CSS variable
          return 'var(--bg-light)';
        }} 
        nodeColor="var(--primary-light)" // Use CSS variable for node fill
        maskColor="rgba(255, 255, 255, 0.2)" // Smoother mask
        className="react-flow-minimap" // Add class for styling
      />
      <Background className="react-flow-background" /> {/* Background is handled by CSS */}
      
      {/* Title Overlay */}
      <Panel position="top-center" className="tree-title-overlay">
        {user?.first_name ? `${user.first_name}'s` : 'My'} Family Lineage
      </Panel>

      {/* Search Bar Overlay */}
      <Panel position="top-left" style={{ top: 80 }} className="search-panel">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search family..." 
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(result => (
                <div 
                  key={result.id} 
                  className="search-result-item"
                  onClick={() => flyToMember(result)}
                >
                  <div className="result-name">{result.first_name} {result.last_name}</div>
                  {result.nickname && <div className="result-nick">({result.nickname})</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </ReactFlow>
  );
};

const Tree = () => {
  const [user, setUser] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [relationType, setRelationType] = useState('');
  const [relativeToId, setRelativeToId] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  // Auto-hide success message after 0.5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleAddRelative = useCallback((type, targetMemberId) => {
    setRelationType(type);
    setRelativeToId(targetMemberId);
    setModalOpen(true);
    setSuccessMessage('');
  }, []);

  const handleAddSelf = () => {
    setRelationType('Self');
    setRelativeToId(null);
    setModalOpen(true);
    setSuccessMessage('');
  };

  const handleMemberAdded = async (message) => {
    setModalOpen(false);
    setSuccessMessage(message || 'Member added successfully!');
    await new Promise(resolve => setTimeout(resolve, 300));
    await fetchFamilyMembers();
  };

  const handleDownload = async () => {
    const flowElement = document.querySelector('.react-flow');
    if (flowElement) {
      flowElement.classList.add('printing-mode');
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for styles to apply

      try {
        const dataUrl = await toPng(flowElement, {
          filter: (node) => {
            // Filter out React Flow controls and minimap for export
            return (
              !node.classList?.contains('react-flow__controls') &&
              !node.classList?.contains('react-flow__minimap') &&
              !node.classList?.contains('action-bar') && // Exclude action bar
              !node.classList?.contains('tree-title-overlay') && // Exclude title overlay
              !node.classList?.contains('search-panel') // Exclude search panel
            );
          },
          backgroundColor: '#f5f7fa',
          pixelRatio: 3, // HD Quality
          style: {
            width: '100%',
            height: '100%',
          }
        });
        download(dataUrl, 'my-family-tree.png');
      } catch (err) {
        console.error('Download failed', err);
      } finally {
        flowElement.classList.remove('printing-mode');
      }
    }
  };

  const handleGenerateBook = async () => {
    setSuccessMessage('Generating Family Book... Please wait.');
    
    const flowElement = document.querySelector('.react-flow');
    if (flowElement) {
      flowElement.classList.add('printing-mode');
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for styles to apply

      try {
        const treeImageBase64 = await toPng(flowElement, {
          filter: (node) => {
            return (
              !node.classList?.contains('react-flow__controls') &&
              !node.classList?.contains('react-flow__minimap') &&
              !node.classList?.contains('action-bar') && // Exclude action bar
              !node.classList?.contains('tree-title-overlay') && // Exclude title overlay
              !node.classList?.contains('search-panel') // Exclude search panel
            );
          },
          backgroundColor: '#f5f7fa',
          pixelRatio: 2, // Slightly lower than download to avoid massive PDF size
          style: {
            width: '100%',
            height: '100%',
          }
        });
        await generateFamilyBook(familyMembers, treeImageBase64, user, serverUrl);
        setSuccessMessage('Family Book generated successfully!');
      } catch (err) {
        console.error('Error generating book:', err);
        setMembersError('Failed to generate book.');
      } finally {
        flowElement.classList.remove('printing-mode');
      }
    }
  };

  return (
    <div className="tree-page-container">
      <Navbar />
      
      {/* Action Bar for Download/Share */}
      {familyMembers.length > 0 && (
        <ActionBar 
          onDownload={handleDownload} 
          onShare={() => setShareModalOpen(true)} 
          onGenerateBook={handleGenerateBook}
        />
      )}

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
                <ReactFlowProvider>
                  <TreeVisualizer 
                    familyMembers={familyMembers}
                    serverUrl={serverUrl}
                    onAddRelative={handleAddRelative}
                    user={user} // Pass the user prop here
                  />
                </ReactFlowProvider>
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

      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
      />
    </div>
  );
};

export default Tree;