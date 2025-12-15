import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './NewsFeed.css';

const NewsFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const activeProfile = JSON.parse(localStorage.getItem('activeProfile'));

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await api.get('/social/feed');
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError('Failed to load news feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      alert('Post content cannot be empty.');
      return;
    }
    if (!activeProfile) {
      alert('Please select an active profile to post.');
      return;
    }

    setIsPosting(true);
    try {
      await api.post('/social/posts', {
        content: newPostContent,
        authorMemberId: activeProfile.id,
      });
      setNewPostContent('');
      fetchFeed(); // Refresh feed
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post.');
    } finally {
      setIsPosting(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // e.g., "12/13/2025, 10:30:00 AM"
  };

  return (
    <div className="news-feed-container">
      <h3 className="feed-title">Family News Feed</h3>

      {activeProfile && (
        <form className="new-post-form" onSubmit={handlePostSubmit}>
          <textarea
            placeholder={`What's on your mind, ${activeProfile.name}?`}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            disabled={isPosting}
          ></textarea>
          <button type="submit" disabled={isPosting}>
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}

      {loading && <p>Loading feed...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="posts-list">
        {!loading && posts.length === 0 && <p className="no-posts">No recent activity. Start by adding a post!</p>}
        {posts.map(post => (
          <div key={post.id} className="post-item">
            <div className="post-header">
              <span className="post-author">{post.author_name}</span>
              <span className="post-time">{formatTimestamp(post.created_at)}</span>
            </div>
            <p className="post-content">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
