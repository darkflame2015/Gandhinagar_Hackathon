import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = express.Router();

// Get government schemes
router.get('/schemes', authenticate, async (req: Request, res: Response) => {
  try {
    const schemes = [
      {
        id: 'KCC',
        name: 'Kisan Credit Card',
        type: 'Credit Scheme',
        benefits: 'Flexible credit, Lower interest rates, Insurance coverage',
        eligibility: 'All farmers with land records',
        provider: 'Banks & Cooperative Societies'
      },
      {
        id: 'PMKSY',
        name: 'Pradhan Mantri Krishi Sinchai Yojana',
        type: 'Irrigation Scheme',
        benefits: 'Subsidy for drip/sprinkler irrigation',
        eligibility: 'Farmers with irrigation needs',
        provider: 'Ministry of Agriculture'
      },
      {
        id: 'SOIL_HEALTH',
        name: 'Soil Health Card Scheme',
        type: 'Crop Advisory',
        benefits: 'Free soil testing, Crop recommendations',
        eligibility: 'All farmers',
        provider: 'Department of Agriculture'
      }
    ];
    
    res.json({ success: true, data: schemes });
  } catch (error: any) {
    logger.error('Error fetching schemes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get input suppliers
router.get('/suppliers/inputs', authenticate, async (req: Request, res: Response) => {
  try {
    const suppliers = [
      {
        id: 'SUP1',
        name: 'Agro Inputs Co.',
        type: 'Seeds & Fertilizers',
        products: ['Hybrid Seeds', 'Organic Fertilizers', 'Pesticides'],
        location: 'Gandhinagar',
        rating: 4.5,
        creditAvailable: true
      },
      {
        id: 'SUP2',
        name: 'Farm Equipment Ltd.',
        type: 'Machinery',
        products: ['Tractors', 'Harvesters', 'Irrigation Equipment'],
        location: 'Ahmedabad',
        rating: 4.7,
        creditAvailable: true
      }
    ];
    
    res.json({ success: true, data: suppliers });
  } catch (error: any) {
    logger.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get warehouse facilities
router.get('/warehouses', authenticate, async (req: Request, res: Response) => {
  try {
    const warehouses = [
      {
        id: 'WH1',
        name: 'Gujarat State Warehouse',
        location: 'Gandhinagar',
        capacity: '10,000 MT',
        availableSpace: '3,000 MT',
        storageRate: '₹5 per quintal per month',
        facilities: ['Cold Storage', 'Fumigation', 'Quality Testing']
      },
      {
        id: 'WH2',
        name: 'FCI Warehouse',
        location: 'Ahmedabad',
        capacity: '15,000 MT',
        availableSpace: '5,000 MT',
        storageRate: '₹4 per quintal per month',
        facilities: ['Scientific Storage', 'Insurance Coverage']
      }
    ];
    
    res.json({ success: true, data: warehouses });
  } catch (error: any) {
    logger.error('Error fetching warehouses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get FPO/JLG information
router.get('/fpo', authenticate, async (req: Request, res: Response) => {
  try {
    const fpos = [
      {
        id: 'FPO1',
        name: 'Gujarat Farmer Producer Company',
        members: 500,
        services: ['Bulk Input Purchase', 'Collective Marketing', 'Credit Facility'],
        location: 'Gandhinagar',
        benefits: 'Better prices, Shared resources, Group lending'
      },
      {
        id: 'FPO2',
        name: 'North Gujarat Agri Cooperative',
        members: 350,
        services: ['Processing Units', 'Cold Chain', 'Export Support'],
        location: 'Mehsana',
        benefits: 'Value addition, Market linkage'
      }
    ];
    
    res.json({ success: true, data: fpos });
  } catch (error: any) {
    logger.error('Error fetching FPOs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
