import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET } from '../config.js';
import User from '../models/User.js';

export const register = async (req, res) =>{
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'username, password, and role are required!!' });
    }
    if (role !== 'teacher' && role !== 'student') {
      return res.status(400).json({ message: 'Role must be either teacher or student!!' });
    }
    
    // Pre-existing user in the db
    const existingUser = await User.findByUsername(username) 
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    
    // user creation with hashed pass
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create(username, hashedPassword, role)
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // find user
    const user = await User.findByUsername(username)    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    //check pass
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful!! Token generated',
      user: {
        id: user.id, 
        username: user.username,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

