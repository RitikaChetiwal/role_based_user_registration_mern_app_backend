import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Set JWT_SECRET if not in .env file
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
}

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/students', studentRoutes);

app.get('/', (req, res) => {
    res.send("hello")
});

mongoose.connect('mongodb+srv://admin:admin@mernapp.mjc44gx.mongodb.net/?retryWrites=true&w=majority&appName=MernApp')
    .then(() => {
        console.log('MongoDB connected');
        app.listen(5000, () => console.log('Server running on 5000'));
    })
    .catch(err => console.error('MongoDB connection error:', err));