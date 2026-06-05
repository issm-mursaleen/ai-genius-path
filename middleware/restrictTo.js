const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      status: 'error',
      message: `Access denied. Requires one of: ${roles.join(', ')}`,
    });
  }
  next();
};

module.exports = restrictTo;
