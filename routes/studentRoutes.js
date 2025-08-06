import express from 'express';
import { 
  getAllStudents, 
  registerStudent, 
  updateStudent, 
  deleteStudent, 
  getStudentById,
  getStudentsWithPagination,
  previewExcelData,
  importStudentsFromExcel,
  exportStudentsToExcel,
  upload
} from '../controllers/studentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ FIXED: Use different paths for different functions
router.get('/', protect, adminOnly, getStudentsWithPagination);  // Main route with pagination
router.get('/all', protect, adminOnly, getAllStudents);          // Alternative route for all students
router.get('/:id', protect, adminOnly, getStudentById);
router.post('/', protect, adminOnly, registerStudent);
router.put('/:id', protect, adminOnly, updateStudent);
router.delete('/:id', protect, adminOnly, deleteStudent);

// Excel import/export routes
router.post('/excel/preview', protect, adminOnly, upload.single('excelFile'), previewExcelData);
router.post('/excel/import', protect, adminOnly, importStudentsFromExcel);
router.get('/excel/export', protect, adminOnly, exportStudentsToExcel);

export default router;