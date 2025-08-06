import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
// import User from './models/User.js';
// import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import chartRoutes from './routes/chartRoutes.js';

dotenv.config();

const app = express();

// Set JWT_SECRET if not in .env file
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
}

app.use(cors());
// app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true
// }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/students', studentRoutes);
app.use('/charts', chartRoutes);

app.get('/', (req, res) => {
    res.send("hello")
});

// const createSuperAdmin = async () => {
//   const plainPassword = process.env.SUPERADMIN_PASSWORD || 'supersecret';
//   const hashedPassword = await bcrypt.hash(plainPassword, 10);

//   await User.create({
//     fullName: process.env.SUPERADMIN_NAME || 'Super Admin',
//     email: process.env.SUPERADMIN_EMAIL || 'superadmin@example.com',
//     password: hashedPassword,
//     role: 'superadmin'
//   });

//   console.log('✅ Super Admin Created');
//   process.exit();
// };

// createSuperAdmin();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(5000, () => console.log('Server running on 5000'));
    })
    .catch(err => console.error('MongoDB connection error:', err));