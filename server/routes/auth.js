const express = require('express');
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/authController');

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// POST /api/auth/signup
router.post('/signup', upload.single('profile_image'), authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
