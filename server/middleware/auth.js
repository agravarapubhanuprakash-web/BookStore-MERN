const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * protect
 * --------------------------------------------------
 * Verifies the JWT sent in the Authorization header
 * (Bearer <token>), looks up the associated user, and
 * attaches it to req.user for downstream handlers.
 *
 * Returns 401 if the token is missing, expired, or
 * belongs to a non-existent user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from "Authorization: Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized, no token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new ApiError(401, 'Not authorized, user no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Not authorized, invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Not authorized, token has expired'));
    }
    next(error);
  }
};

/**
 * adminOnly
 * --------------------------------------------------
 * Must be used AFTER the protect middleware.
 * Checks that the authenticated user has the 'admin'
 * role. Returns 403 if not.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new ApiError(403, 'Access denied. Admin privileges required'));
  }
};

module.exports = { protect, adminOnly };
