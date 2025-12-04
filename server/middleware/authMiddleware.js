const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication invalid: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Attach the user payload to the request object
    req.user = { userId: payload.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication invalid: Token verification failed' });
  }
};

module.exports = authMiddleware;
