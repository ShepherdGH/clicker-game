// authMiddleware.js
const jwt = require('jsonwebtoken');

// Use environment variable for the secret key
// NOTE: For a real app, this should be set in a .env file.
const JWT_SECRET = process.env.JWT_SECRET || 'a-super-secret-fallback-key-for-dev'; 

const authMiddleware = (req, res, next) => {
  // Check for the token in the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach the decoded user payload (e.g., { id: 1, username: 'test' }) to the request object
    req.user = decoded; 
    next();
  } catch (error) {
    // This catches expired or invalid tokens
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;