import express, { Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { getInsuranceRecommendations } from '../services/insurance.service';
import logger from '../utils/logger';

const router = express.Router();

// Get insurance products
router.get('/products', authenticate, async (req: Request, res: Response) => {
  try {
    const products = [
      {
        id: 'CROP_INS_001',
        name: 'Comprehensive Crop Insurance',
        type: 'Crop Insurance',
        coverage: 'Full crop cycle protection',
        premium: 15000,
        sumInsured: 500000,
        description: 'Protects against yield loss, pest damage, and natural calamities including drought, flood, and storms.',
        features: [
          'Covers all stages of crop growth',
          'Protection against pest and disease',
          'Natural calamity coverage',
          'Subsidized premium rates',
          'Quick claim settlement within 15 days'
        ]
      },
      {
        id: 'WEATHER_INS_001',
        name: 'Weather-Based Crop Insurance',
        type: 'Weather Insurance',
        coverage: 'Parametric weather protection',
        premium: 8000,
        sumInsured: 300000,
        description: 'Covers losses due to adverse weather conditions including drought, flood, hailstorm, and extreme temperatures.',
        features: [
          'Automated trigger-based payouts',
          'Satellite and weather station data',
          'No crop loss assessment needed',
          'Fast claim processing (7 days)',
          'Covers drought and flood risks'
        ]
      },
      {
        id: 'LIVESTOCK_INS_001',
        name: 'Livestock Insurance',
        type: 'Livestock Insurance',
        coverage: 'Cattle and livestock protection',
        premium: 6000,
        sumInsured: 200000,
        description: 'Comprehensive insurance for cattle, buffalo, and other livestock against death, disease, and accidents.',
        features: [
          'Coverage for death due to disease',
          'Accident and injury protection',
          'Veterinary treatment coverage',
          'Surgical expenses included',
          'Permanent disability coverage'
        ]
      }
    ];

    // Simulated active policies
    const activePolicies = [
      {
        id: 'POL_001',
        productName: 'Comprehensive Crop Insurance',
        policyNumber: 'CROP2024001',
        startDate: new Date('2024-06-01').toISOString(),
        endDate: new Date('2025-05-31').toISOString(),
        status: 'Active',
        premium: 15000,
        coverage: '₹5,00,000'
      }
    ];
    
    res.json({ success: true, data: { products, activePolicies } });
  } catch (error: any) {
    logger.error('Error fetching insurance products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get claim status
router.get('/claims/:policyNumber', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { policyNumber } = (req as any).params;
    
    // Simulated claim data
    const claim = {
      policyNumber,
      claimId: `CLM-${Date.now()}`,
      status: 'Processing',
      filedDate: new Date(),
      amount: 50000,
      triggerType: 'Drought',
      estimatedSettlement: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    
    res.json({ success: true, data: claim });
  } catch (error: any) {
    logger.error('Error fetching claim status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Apply for insurance policy
router.post('/apply', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, cropType, landArea, season, sumInsured } = req.body;
    const farmerId = (req as any).user.farmerId;

    // Validate required fields
    if (!productId || !cropType || !landArea || !season || !sumInsured) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Simulated policy creation
    const policyNumber = `POL-${Date.now()}`;
    const application = {
      id: `APP-${Date.now()}`,
      policyNumber,
      farmerId,
      productId,
      cropType,
      landArea: parseFloat(landArea),
      season,
      sumInsured: parseFloat(sumInsured),
      status: 'Pending',
      appliedDate: new Date(),
      estimatedApproval: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    };

    logger.info(`Insurance application submitted: ${policyNumber}`);
    
    res.json({
      success: true,
      message: 'Insurance application submitted successfully',
      data: application
    });
  } catch (error: any) {
    logger.error('Error submitting insurance application:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
