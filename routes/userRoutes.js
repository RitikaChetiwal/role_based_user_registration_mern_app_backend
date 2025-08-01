import express from 'express';
import { getAllUsers, registerUser, loginUser, updateUser, deleteUser, getUsersWithPagination } from '../controllers/userController.js';
// import { verifyAdmin } from '../middleware/auth.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/', protect, adminOnly, getAllUsers);
router.get('/paginated', protect, adminOnly, getUsersWithPagination);
router.post('/', protect, adminOnly, registerUser);
// router.post('/login', loginUser);
router.put('/:id', protect, adminOnly, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;