// 📁 server/routes/authRoutes.js
import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';
import { loginUser } from '../controllers/userController.js';
dotenv.config();

const router = express.Router();

// Signup (Admin only)
router.post('/signup', protect, adminOnly, async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const newUser = new User({ fullName, email, password: hash, role });
  await newUser.save();
  res.json({ msg: 'User created' });
});

router.post('/login', loginUser);

// Profile
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

export default router;


