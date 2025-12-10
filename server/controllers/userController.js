const db = require('../db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const updateUserProfile = async (req, res) => {
  const { userId } = req.user;
  const { first_name, last_name, email, password, old_password } = req.body;
  
  const client = await db.getClient();

  try {
    const { rows } = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updateFields = [];
    const values = [];
    let valueIndex = 1;

    // Add basic fields to update
    if (first_name) {
      updateFields.push(`first_name = $${valueIndex++}`);
      values.push(first_name);
    }
    if (last_name) {
      updateFields.push(`last_name = $${valueIndex++}`);
      values.push(last_name);
    }
    if (email) {
      updateFields.push(`email = $${valueIndex++}`);
      values.push(email);
    }

    // Handle profile image update
    if (req.file) {
      const profileImageUrl = `/uploads/${req.file.filename}`;
      updateFields.push(`profile_img_url = $${valueIndex++}`);
      values.push(profileImageUrl);
    }

    // Handle password update
    if (password && old_password) {
      const isMatch = await bcrypt.compare(old_password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect current password.' });
      }
      const newPasswordHash = await bcrypt.hash(password, saltRounds);
      updateFields.push(`password_hash = $${valueIndex++}`);
      values.push(newPasswordHash);
    } else if (password && !old_password) {
      return res.status(400).json({ message: 'Current password is required to set a new password.' });
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    const updateQuery = `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${valueIndex} RETURNING id, email, first_name, last_name, profile_img_url`;
    values.push(userId);

    const updatedResult = await client.query(updateQuery, values);

    res.status(200).json({
      message: 'Profile updated successfully!',
      user: updatedResult.rows[0],
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};

module.exports = { updateUserProfile };
