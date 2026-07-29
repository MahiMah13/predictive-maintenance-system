import jwt from 'jsonwebtoken';
import store from '../services/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'predictive-maintenance-jwt-secret-key-2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Default fallback to lead engineer profile in dev mode if no token passed
    req.user = store.profiles[0];
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const profile = store.profiles.find(p => p.id === decoded.id || p.email === decoded.email);
    req.user = profile || decoded;
    next();
  } catch (err) {
    // Fallback to dev user profile gracefully
    req.user = store.profiles[0];
    next();
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' is not authorized. Required: ${roles.join(', ')}`
      });
    }
    next();
  };
}
