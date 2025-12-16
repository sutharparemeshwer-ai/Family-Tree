import React, { useState, useEffect, useCallback } from 'react';
import api, { SERVER_URL } from '../utils/api';
import MemoryCard from './MemoryCard';
import MemoryViewerModal from './MemoryViewerModal';
import ConfirmationModal from './ConfirmationModal'; // Import new component
import './MemoryGallery.css';

const MemoryGallery = ({ memberId, memberName, onAddMemory }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const serverUrl = SERVER_URL;

  // State for Memory Viewer Modal
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [selectedMemoryForViewer, setSelectedMemoryForViewer] = useState(null);

  // State for Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState(null);

  const fetchMemories = useCallback(async () => {
    if (!memberId) {
      setMemories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/memories?memberId=${memberId}`);
      setMemories(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load memories.');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  // Open modal instead of deleting immediately
  const handleDeleteRequest = (memoryId) => {
    setMemoryToDelete(memoryId);
    setIsDeleteModalOpen(true);
  };

  // Actual deletion logic
  const confirmDelete = async () => {
    if (!memoryToDelete) return;

    try {
      await api.delete(`/memories/${memoryToDelete}`);
      setMemories(prev => prev.filter(m => m.id !== memoryToDelete)); // Optimistic update
      setIsDeleteModalOpen(false);
      setMemoryToDelete(null);
    } catch (err) {
      console.error('Failed to delete memory:', err);
      // Optionally show error toast here
      setIsDeleteModalOpen(false);
    }
  };

  const handleViewMemory = (memory) => {
    setSelectedMemoryForViewer(memory);
    setIsViewerModalOpen(true);
  };

  return (
    <div className="memory-gallery-container">
      <header className="gallery-header">
        <h2>Memories with {memberName || '...'}</h2>
        <button className="add-memory-btn" onClick={onAddMemory}>Add Memory</button>
      </header>
      <div className="memory-grid">
        {loading && <p>Loading memories...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          <>
            {memories.length > 0 ? (
              memories.map(memory => (
                <MemoryCard 
                  key={memory.id} 
                  memory={memory} 
                  onDelete={handleDeleteRequest} // Pass the request handler
                  onViewMemory={handleViewMemory}
                />
              ))
            ) : (
              <div className="memory-card-placeholder">
                <p>No memories yet for {memberName}. Start by adding one!</p>
              </div>
            )}
          </>
        )}
      </div>

      <MemoryViewerModal
        isOpen={isViewerModalOpen}
        onClose={() => setIsViewerModalOpen(false)}
        memory={selectedMemoryForViewer}
        serverUrl={serverUrl}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Memory?"
        message="Are you sure you want to delete this memory? This action cannot be undone."
      />
    </div>
  );
};

export default MemoryGallery;
