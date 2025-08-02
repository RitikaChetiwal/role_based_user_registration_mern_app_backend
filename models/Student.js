import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: Number,
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 17,
    max: 28
  },
  course: {
    type: String,
    required: true,
    enum: ['Computer Science', 'Engineering', 'Business', 'Arts', 'Science', 'Mathematics', 'Literature', 'Medicine']
  },
  department: {
    type: String,
    required: true,
    enum: ['Tech', 'Non-Tech', 'Design']
  },
  hobbies: {
    type: String,
    required: true,
    enum: ['Music', 'Dancing', 'Painting', 'Traveling']
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    type: String,
    required: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Graduated', 'Dropped'],
    default: 'Active'
  }
}, {
  timestamps: true
});

export default mongoose.model('Student', studentSchema);