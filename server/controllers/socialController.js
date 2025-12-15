const db = require('../db');

// Helper to get selected member's info
const getMemberInfo = async (memberId, treeOwnerId) => {
  const result = await db.query(
    'SELECT first_name, last_name FROM family_members WHERE id = $1 AND tree_owner_id = $2',
    [memberId, treeOwnerId]
  );
  return result.rows[0];
};

// --- Posts (News Feed) ---

exports.createPost = async (req, res) => {
  const { content, authorMemberId } = req.body;
  const tree_owner_id = req.user.userId;

  if (!content || !authorMemberId) {
    return res.status(400).json({ message: 'Content and author are required.' });
  }

  try {
    const authorInfo = await getMemberInfo(authorMemberId, tree_owner_id);
    if (!authorInfo) {
      return res.status(404).json({ message: 'Author member not found.' });
    }
    const author_name = `${authorInfo.first_name} ${authorInfo.last_name || ''}`;

    const result = await db.query(
      'INSERT INTO posts (tree_owner_id, author_name, content) VALUES ($1, $2, $3) RETURNING *',
      [tree_owner_id, author_name, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getFeed = async (req, res) => {
  const tree_owner_id = req.user.userId;

  try {
    // This query fetches a mix of posts and recent memory additions
    // For simplicity, we'll fetch posts only for now.
    // A more complex query would UNION posts, memory additions, and new member additions.
    const postsResult = await db.query(
      `SELECT p.id, p.author_name, p.content, p.created_at, 'post' as type
       FROM posts p
       WHERE p.tree_owner_id = $1
       ORDER BY p.created_at DESC
       LIMIT 10`,
      [tree_owner_id]
    );

    res.json(postsResult.rows);

  } catch (err) {
    console.error('Error fetching feed:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Comments ---

exports.addComment = async (req, res) => {
  const { memoryId } = req.params;
  const { content, authorMemberId } = req.body;
  const tree_owner_id = req.user.userId;

  if (!content || !authorMemberId) {
    return res.status(400).json({ message: 'Content and author are required.' });
  }

  try {
    // Verify memory belongs to user's tree
    const memoryCheck = await db.query(
      'SELECT id FROM memories WHERE id = $1 AND tree_owner_id = $2',
      [memoryId, tree_owner_id]
    );
    if (memoryCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Memory not found or not accessible.' });
    }

    const authorInfo = await getMemberInfo(authorMemberId, tree_owner_id);
    if (!authorInfo) {
      return res.status(404).json({ message: 'Author member not found.' });
    }
    const author_name = `${authorInfo.first_name} ${authorInfo.last_name || ''}`;

    const result = await db.query(
      'INSERT INTO comments (memory_id, author_name, content) VALUES ($1, $2, $3) RETURNING *',
      [memoryId, author_name, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getComments = async (req, res) => {
  const { memoryId } = req.params;
  const tree_owner_id = req.user.userId;

  try {
    // Verify memory belongs to user's tree
    const memoryCheck = await db.query(
      'SELECT id FROM memories WHERE id = $1 AND tree_owner_id = $2',
      [memoryId, tree_owner_id]
    );
    if (memoryCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Memory not found or not accessible.' });
    }

    const result = await db.query(
      'SELECT * FROM comments WHERE memory_id = $1 ORDER BY created_at ASC',
      [memoryId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
