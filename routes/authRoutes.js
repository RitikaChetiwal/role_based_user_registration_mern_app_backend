// 📁 server/routes/authRoutes.js
import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

// Login
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return res.status(401).json({ msg: 'Invalid credentials' });
//   }
//   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//   res.json({ token, user });
// });

router.post('/login', loginUser);

// Profile
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

export default router;


