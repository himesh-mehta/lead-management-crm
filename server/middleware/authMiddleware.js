const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get Authorization header
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization token provided. Please log in.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format is invalid. Must be Bearer <token>' });
  }

  const token = parts[1];

  try {
    const secret = process.env.JWT_SECRET || 'leadbridge_jwt_secret_key_2026';
    const decoded = jwt.verify(token, secret);
    
    // Inject decoded user parameters (id, email) into request
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[authMiddleware]', err.message);
    return res.status(401).json({ message: 'Authorization token is expired or invalid. Please log in again.' });
  }
};

module.exports = authMiddleware;
