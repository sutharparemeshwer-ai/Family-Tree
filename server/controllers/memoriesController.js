const db = require('../db');

const createMemory = async (req, res) => {
  const { title, description, memberId } = req.body;
  const tree_owner_id = req.user.userId;
  const files = req.files; // Array of files from multer

  if (!title || !memberId) {
    return res.status(400).json({ message: 'Title and memberId are required.' });
  }

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'At least one photo or video is required.' });
  }

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Step 1: Insert the new memory
    const memoryQuery = `
      INSERT INTO memories(tree_owner_id, member_id, title, description)
      VALUES($1, $2, $3, $4)
      RETURNING id;
    `;
    const memoryResult = await client.query(memoryQuery, [
      tree_owner_id,
      memberId,
      title,
      description,
    ]);
    const newMemoryId = memoryResult.rows[0].id;

    // Step 2: Insert file records into memory_files
    const fileInsertPromises = files.map(file => {
      const fileUrl = `/uploads/${file.filename}`;
      const fileType = file.mimetype.startsWith('image') ? 'image' : 'video';
      const fileQuery = `
        INSERT INTO memory_files(memory_id, file_url, file_type)
        VALUES($1, $2, $3);
      `;
      return client.query(fileQuery, [newMemoryId, fileUrl, fileType]);
    });

    await Promise.all(fileInsertPromises);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Memory created successfully!', memoryId: newMemoryId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating memory:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getMemoriesByMember = async (req, res) => {
  const { memberId } = req.query;
  const tree_owner_id = req.user.userId;

  if (!memberId) {
    return res.status(400).json({ message: 'memberId query parameter is required.' });
  }

  try {
    // Fetch memories and their associated files
    const query = `
      SELECT
        m.id,
        m.title,
        m.description,
        m.created_at,
        COALESCE(
          (
            SELECT json_agg(json_build_object('url', mf.file_url, 'type', mf.file_type))
            FROM memory_files mf
            WHERE mf.memory_id = m.id
          ),
          '[]'::json
        ) AS files
      FROM memories m
      WHERE m.tree_owner_id = $1 AND m.member_id = $2
      ORDER BY m.created_at DESC;
    `;
    const result = await db.query(query, [tree_owner_id, memberId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Placeholder for delete and update
const deleteMemory = async (req, res) => {
    res.status(501).json({ message: 'Not implemented' });
};

const updateMemory = async (req, res) => {
    res.status(501).json({ message: 'Not implemented' });
};


module.exports = {
  createMemory,
  getMemoriesByMember,
  deleteMemory,
  updateMemory,
};
