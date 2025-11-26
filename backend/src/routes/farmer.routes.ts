import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import db from '../database/db';

const router = Router();

// Middleware to verify token
const authMiddleware = (req: any, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.farmerId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get farmer profile
router.get('/profile', authMiddleware, (req: any, res: Response) => {
  try {
    const farmer: any = db.prepare('SELECT * FROM farmers WHERE id = ?').get(req.farmerId);
    
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    delete farmer.password;
    
    // Parse JSON fields and structure response to match frontend expectations
    const profileData = {
      farmerId: farmer.farmerId,
      name: farmer.name,
      email: farmer.email,
      phone: farmer.phone,
      address: {
        village: farmer.village,
        district: farmer.district,
        state: farmer.state,
        pincode: farmer.pincode,
        coordinates: farmer.latitude && farmer.longitude ? {
          latitude: farmer.latitude,
          longitude: farmer.longitude
        } : null
      },
      landDetails: {
        totalArea: farmer.totalArea || 0,
        soilType: farmer.soilType,
        irrigationType: farmer.irrigationType,
        crops: farmer.crops ? JSON.parse(farmer.crops) : []
      },
      kycDocuments: {
        aadhaar: farmer.aadhaar,
        pan: farmer.pan,
        landRecords: farmer.landRecords,
        bankAccount: farmer.bankAccount
      },
      agriStackData: {
        farmerId: farmer.agriStackId,
        verified: Boolean(farmer.agriStackVerified),
        lastSync: farmer.updatedAt
      },
      creditScore: farmer.creditScore || 0,
      fpo: farmer.fpo,
      isVerified: Boolean(farmer.isVerified),
      createdAt: farmer.createdAt,
      updatedAt: farmer.updatedAt
    };

    res.json({ success: true, data: profileData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
});

// Update farmer profile
router.put('/profile', authMiddleware, (req: any, res: Response) => {
  try {
    const { name, phone, village, district, state, pincode, totalArea, soilType, irrigationType, crops } = req.body;

    const stmt = db.prepare(`
      UPDATE farmers 
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          village = COALESCE(?, village),
          district = COALESCE(?, district),
          state = COALESCE(?, state),
          pincode = COALESCE(?, pincode),
          totalArea = COALESCE(?, totalArea),
          soilType = COALESCE(?, soilType),
          irrigationType = COALESCE(?, irrigationType),
          crops = COALESCE(?, crops),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name, phone, village, district, state, pincode,
      totalArea, soilType, irrigationType,
      crops ? JSON.stringify(crops) : null,
      req.farmerId
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

export default router;
