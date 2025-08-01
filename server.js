import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // only if you use cookies or auth headers
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.send("hello")
})

mongoose.connect('mongodb+srv://admin:admin@mernapp.mjc44gx.mongodb.net/?retryWrites=true&w=majority&appName=MernApp')
    .then(() => app.listen(5000, () => console.log('Server running on 5000')));


