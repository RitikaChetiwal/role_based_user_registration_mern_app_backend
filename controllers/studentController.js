import Student from '../models/Student.js';
import xlsx from 'xlsx';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed!'), false);
    }
  }
});

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
      status,
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

// Get students with pagination
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

// Preview Excel data
export const previewExcelData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    // Process and validate data
    const processedData = jsonData.map((row, index) => {
      const processedRow = {
        rowNumber: index + 1,
        fullName: row['Full Name'] || row['fullName'] || '',
        email: row['Email'] || row['email'] || '',
        phone: row['Phone'] || row['phone'] || '',
        age: row['Age'] || row['age'] || '',
        course: row['Course'] || row['course'] || '',
        department: row['Department'] || row['department'] || '',
        hobbies: row['Hobbies'] || row['hobbies'] || '',
        gender: row['Gender'] || row['gender'] || '',
        address: row['Address'] || row['address'] || '',
        status: row['Status'] || row['status'] || 'Active',
        emergencyContactName: row['Emergency Contact Name'] || row['emergencyContactName'] || '',
        emergencyContactPhone: row['Emergency Contact Phone'] || row['emergencyContactPhone'] || '',
        emergencyContactRelation: row['Emergency Contact Relation'] || row['emergencyContactRelation'] || '',
        errors: []
      };

      // Validation
      if (!processedRow.fullName) processedRow.errors.push('Full Name is required');
      if (!processedRow.email) processedRow.errors.push('Email is required');
      if (!processedRow.phone) processedRow.errors.push('Phone is required');
      if (!processedRow.age) processedRow.errors.push('Age is required');
      if (!processedRow.course) processedRow.errors.push('Course is required');
      if (!processedRow.department) processedRow.errors.push('Department is required');
      if (!processedRow.hobbies) processedRow.errors.push('Hobbies is required');
      if (!processedRow.gender) processedRow.errors.push('Gender is required');
      if (!processedRow.address) processedRow.errors.push('Address is required');

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (processedRow.email && !emailRegex.test(processedRow.email)) {
        processedRow.errors.push('Invalid email format');
      }

      // Age validation
      if (processedRow.age && (processedRow.age < 17 || processedRow.age > 28)) {
        processedRow.errors.push('Age must be between 17 and 28');
      }

      // Course validation
      const validCourses = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Science', 'Mathematics', 'Literature', 'Medicine'];
      if (processedRow.course && !validCourses.includes(processedRow.course)) {
        processedRow.errors.push('Invalid course');
      }

      // Department validation
      const validDepartments = ['Tech', 'Non-Tech', 'Design'];
      if (processedRow.department && !validDepartments.includes(processedRow.department)) {
        processedRow.errors.push('Invalid department');
      }

      // Hobbies validation
      const validHobbies = ['Music', 'Dancing', 'Painting', 'Traveling'];
      if (processedRow.hobbies && !validHobbies.includes(processedRow.hobbies)) {
        processedRow.errors.push('Invalid hobbies');
      }

      // Gender validation
      const validGenders = ['Male', 'Female', 'Other'];
      if (processedRow.gender && !validGenders.includes(processedRow.gender)) {
        processedRow.errors.push('Invalid gender');
      }

      // Status validation
      const validStatuses = ['Active', 'Inactive', 'Graduated', 'Dropped'];
      if (processedRow.status && !validStatuses.includes(processedRow.status)) {
        processedRow.errors.push('Invalid status');
      }

      return processedRow;
    });

    const validRows = processedData.filter(row => row.errors.length === 0);
    const invalidRows = processedData.filter(row => row.errors.length > 0);

    res.json({
      message: 'Excel data processed successfully',
      totalRows: processedData.length,
      validRows: validRows.length,
      invalidRows: invalidRows.length,
      data: processedData
    });

  } catch (error) {
    console.error('Excel preview error:', error);
    res.status(500).json({ message: 'Failed to process Excel file', error: error.message });
  }
};

// Import students from Excel
export const importStudentsFromExcel = async (req, res) => {
  try {
    const { validStudents } = req.body;

    if (!validStudents || validStudents.length === 0) {
      return res.status(400).json({ message: 'No valid students to import' });
    }

    const studentsToImport = [];
    const duplicateEmails = [];
    const importErrors = [];

    // Check for existing emails
    for (const studentData of validStudents) {
      const existingStudent = await Student.findOne({ email: studentData.email });
      if (existingStudent) {
        duplicateEmails.push({
          email: studentData.email,
          fullName: studentData.fullName
        });
      } else {
        studentsToImport.push({
          fullName: studentData.fullName,
          email: studentData.email,
          phone: parseInt(studentData.phone),
          age: parseInt(studentData.age),
          course: studentData.course,
          department: studentData.department,
          hobbies: studentData.hobbies,
          gender: studentData.gender,
          address: studentData.address,
          status: studentData.status || 'Active',
          emergencyContact: {
            name: studentData.emergencyContactName || '',
            phone: studentData.emergencyContactPhone || '',
            relation: studentData.emergencyContactRelation || ''
          }
        });
      }
    }

    // Bulk insert valid students
    let importedStudents = [];
    if (studentsToImport.length > 0) {
      try {
        importedStudents = await Student.insertMany(studentsToImport, { ordered: false });
      } catch (error) {
        // Handle partial success in bulk insert
        if (error.writeErrors) {
          importedStudents = error.insertedDocs || [];
          error.writeErrors.forEach(writeError => {
            importErrors.push({
              index: writeError.index,
              error: writeError.errmsg
            });
          });
        } else {
          throw error;
        }
      }
    }

    res.json({
      message: 'Import completed',
      totalProcessed: validStudents.length,
      successfulImports: importedStudents.length,
      duplicateEmails: duplicateEmails.length,
      errors: importErrors.length,
      details: {
        imported: importedStudents,
        duplicates: duplicateEmails,
        errors: importErrors
      }
    });

  } catch (error) {
    console.error('Excel import error:', error);
    res.status(500).json({ message: 'Failed to import students', error: error.message });
  }
};

// Export students to Excel
export const exportStudentsToExcel = async (req, res) => {
  try {
    const { search, status, course, department } = req.query;

    // Build search query
    let searchQuery = {};
    
    if (search) {
      searchQuery.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      searchQuery.status = status;
    }

    if (course && course !== 'all') {
      searchQuery.course = course;
    }

    if (department && department !== 'all') {
      searchQuery.department = department;
    }

    // Get all students matching the criteria
    const students = await Student.find(searchQuery).sort({ createdAt: -1 });

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found to export' });
    }

    // Prepare data for Excel export
    const excelData = students.map((student, index) => ({
      'S.No': index + 1,
      'Full Name': student.fullName,
      'Email': student.email,
      'Phone': student.phone,
      'Age': student.age,
      'Course': student.course,
      'Department': student.department,
      'Hobbies': student.hobbies,
      'Gender': student.gender,
      'Address': student.address,
      'Status': student.status,
      'Emergency Contact Name': student.emergencyContact?.name || '',
      'Emergency Contact Phone': student.emergencyContact?.phone || '',
      'Emergency Contact Relation': student.emergencyContact?.relation || '',
      'Enrollment Date': student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : '',
      'Created At': new Date(student.createdAt).toLocaleDateString(),
      'Updated At': new Date(student.updatedAt).toLocaleDateString()
    }));

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 8 },  // S.No
      { wch: 20 }, // Full Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 8 },  // Age
      { wch: 18 }, // Course
      { wch: 12 }, // Department
      { wch: 12 }, // Hobbies
      { wch: 10 }, // Gender
      { wch: 30 }, // Address
      { wch: 12 }, // Status
      { wch: 20 }, // Emergency Contact Name
      { wch: 18 }, // Emergency Contact Phone
      { wch: 15 }, // Emergency Contact Relation
      { wch: 15 }, // Enrollment Date
      { wch: 12 }, // Created At
      { wch: 12 }  // Updated At
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

    // Generate buffer
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    const filename = `students_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    // Send the file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ message: 'Failed to export students', error: error.message });
  }
};