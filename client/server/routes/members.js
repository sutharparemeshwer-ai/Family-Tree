const express = require('express');
const router = express.Router();
const membersController = require('../controllers/membersController');

// POST /api/members
// This will be the endpoint to add a new family member
router.post('/', membersController.createMember);

module.exports = router;
