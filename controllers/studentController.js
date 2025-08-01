import Student from '../models/Student.js';

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

// Register a new student
export const registerStudent = async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      phone, 
      age, 
      course, 
      gender, 
      address, 
      emergencyContact,
      status ,
      department,
      hobbies
    } = req.body;

    // Check if student with email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    const newStudent = new Student({
      fullName,
      email,
      phone,
      age,
      course,
      gender,
      address,
      emergencyContact,
      status: status || 'Active',
      department,
      hobbies
    });

    await newStudent.save();
    res.status(201).json({ 
      message: 'Student registered successfully', 
      student: newStudent 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }
    res.status(500).json({ message: 'Student registration failed', error: error.message });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if student exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if email is already taken by another student
    if (updateData.email && updateData.email !== student.email) {
      const existingStudent = await Student.findOne({ email: updateData.email });
      if (existingStudent) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    });

    res.json({ 
      message: 'Student updated successfully', 
      student: updatedStudent 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student', error: error.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.findByIdAndDelete(id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student' });
  }
};

// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student' });
  }
};

// Add after existing functions
export const getStudentsWithPagination = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const searchQuery = search ? {
      $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const students = await Student.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    res.json({
      students,
      pagination: {
        currentPage: page,
        totalPages,
        totalStudents: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};