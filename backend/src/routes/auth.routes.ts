import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, address, landDetails } = req.body;

    // Extract address fields
    const village = address?.village || '';
    const district = address?.district || '';
    const state = address?.state || '';
    const pincode = address?.pincode || '';

    // Extract land details
    const totalArea = landDetails?.totalArea || 0;
    const soilType = landDetails?.soilType || '';
    const irrigationType = landDetails?.irrigationType || '';
    const crops = landDetails?.crops ? JSON.stringify(landDetails.crops) : JSON.stringify([]);

    // Check if user exists
    const existing = db.prepare('SELECT * FROM farmers WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate farmer ID
    const count = db.prepare('SELECT COUNT(*) as count FROM farmers').get() as { count: number };
    const farmerId = `FARMER${String(count.count + 1).padStart(6, '0')}`;

    // Insert farmer
    const stmt = db.prepare(`
      INSERT INTO farmers (
        farmerId, name, email, phone, password, 
        village, district, state, pincode,
        totalArea, soilType, irrigationType, crops
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      farmerId, name, email, phone, hashedPassword,
      village, district, state, pincode,
      totalArea, soilType, irrigationType, crops
    );

    // Generate token
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const token = jwt.sign(
      { id: result.lastInsertRowid, email, farmerId },
      secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully',
      data: {
        token,
        farmerId,
        name,
        email,
        phone
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find farmer
    const farmer: any = db.prepare('SELECT * FROM farmers WHERE email = ?').get(email);
    
    if (!farmer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, farmer.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const token = jwt.sign(
      { id: farmer.id, email: farmer.email, farmerId: farmer.farmerId },
      secret,
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete farmer.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        farmerId: farmer.farmerId,
        name: farmer.name,
        email: farmer.email,
        phone: farmer.phone,
        creditScore: farmer.creditScore,
        isVerified: farmer.isVerified === 1
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const farmer: any = db.prepare('SELECT * FROM farmers WHERE id = ?').get(decoded.id);
    
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    delete farmer.password;

    res.json({ farmer });
  } catch (error: any) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
