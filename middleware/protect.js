const { verifyAccessToken } = require('../utils/jwt');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    // Attach only safe fields to req.user
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Access token expired. Please refresh.' });
    }
    return res.status(401).json({ status: 'error', message: 'Invalid token. Please log in again.' });
  }
};

module.exports = protect;
