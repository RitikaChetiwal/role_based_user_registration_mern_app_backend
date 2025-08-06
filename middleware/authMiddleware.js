import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ msg: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Unauthorized' });
  }
};

// Modify adminOnly middleware
export const adminOnly = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ msg: 'Admins only' });
  }
};

// Add superadminOnly middleware
export const superadminOnly = (req, res, next) => {
  if (req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ msg: 'Superadmin only' });
  }
};