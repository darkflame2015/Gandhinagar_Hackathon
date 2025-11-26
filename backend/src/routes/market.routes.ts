import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = express.Router();

// Enhanced crop data with categories
const cropDatabase: Record<string, { price: number; unit: string; category: string }> = {
  'Wheat': { price: 2150, unit: '₹/quintal', category: 'Cereal' },
  'Rice': { price: 2850, unit: '₹/quintal', category: 'Cereal' },
  'Cotton': { price: 6500, unit: '₹/quintal', category: 'Cash Crop' },
  'Bajra': { price: 1800, unit: '₹/quintal', category: 'Cereal' },
  'Maize': { price: 1950, unit: '₹/quintal', category: 'Cereal' },
  'Soybean': { price: 4200, unit: '₹/quintal', category: 'Oilseed' },
  'Groundnut': { price: 5500, unit: '₹/quintal', category: 'Oilseed' },
  'Sugarcane': { price: 3200, unit: '₹/quintal', category: 'Cash Crop' },
  'Potato': { price: 1200, unit: '₹/quintal', category: 'Vegetable' },
  'Onion': { price: 1800, unit: '₹/quintal', category: 'Vegetable' },
  'Tomato': { price: 2000, unit: '₹/quintal', category: 'Vegetable' },
  'Jowar': { price: 2900, unit: '₹/quintal', category: 'Cereal' },
  'Tur': { price: 6200, unit: '₹/quintal', category: 'Pulse' },
  'Gram': { price: 5100, unit: '₹/quintal', category: 'Pulse' },
  'Urad': { price: 6800, unit: '₹/quintal', category: 'Pulse' }
};

// Get market prices for crops (with filtering)
router.get('/prices', authenticate, async (req: Request, res: Response) => {
  try {
    const { crops, category } = req.query;
    
    let selectedCrops: string[] = [];
    
    // Filter by specific crops
    if (crops && typeof crops === 'string') {
      selectedCrops = crops.split(',').map(c => c.trim());
    } else if (category && typeof category === 'string') {
      // Filter by category
      selectedCrops = Object.keys(cropDatabase).filter(crop => 
        cropDatabase[crop].category.toLowerCase() === category.toLowerCase()
      );
    } else {
      // Default: top 10 crops
      selectedCrops = ['Wheat', 'Rice', 'Cotton', 'Soybean', 'Sugarcane', 
                       'Groundnut', 'Tur', 'Gram', 'Maize', 'Potato'];
    }
    
    const prices = selectedCrops.map(cropName => {
      const cropInfo = cropDatabase[cropName];
      if (!cropInfo) {
        return null;
      }
      
      const basePrice = cropInfo.price;
      const variation = (Math.random() - 0.5) * 500;
      const currentPrice = basePrice + variation;
      const change = (Math.random() - 0.5) * 15;
      
      return {
        crop: cropName,
        category: cropInfo.category,
        price: Math.round(currentPrice),
        previousPrice: Math.round(currentPrice - (currentPrice * change / 100)),
        change: Math.round(change * 10) / 10,
        trend: change > 0 ? 'UP' : 'DOWN',
        unit: cropInfo.unit,
        market: 'National Average',
        volatility: Math.round(Math.random() * 50) / 100,
        lastUpdated: new Date().toISOString()
      };
    }).filter(p => p !== null);
    
    // Calculate summary stats
    const avgChange = prices.reduce((sum, p) => sum + (p?.change || 0), 0) / prices.length;
    const upTrend = prices.filter(p => p?.trend === 'UP').length;
    const downTrend = prices.filter(p => p?.trend === 'DOWN').length;
    
    res.json({ 
      success: true, 
      data: {
        prices,
        summary: {
          totalCrops: prices.length,
          avgChange: Math.round(avgChange * 10) / 10,
          upTrend,
          downTrend,
          marketSentiment: avgChange > 2 ? 'Bullish' : avgChange < -2 ? 'Bearish' : 'Neutral'
        },
        source: 'Agmarknet Base (Simulated Variation)'
      }
    });
  } catch (error: any) {
    logger.error('Error fetching market prices:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get mandi prices
router.get('/mandi', authenticate, async (req: Request, res: Response) => {
  try {
    const { state, district } = req.query;
    
    // Simulated mandi data - replace with actual Agmarknet API
    const mandiPrices = [
      { mandi: 'Gandhinagar Mandi', crop: 'Wheat', price: 2500, date: new Date() },
      { mandi: 'Ahmedabad Mandi', crop: 'Rice', price: 3200, date: new Date() },
      { mandi: 'Gandhinagar Mandi', crop: 'Cotton', price: 6800, date: new Date() }
    ];
    
    res.json({ success: true, data: mandiPrices });
  } catch (error: any) {
    logger.error('Error fetching mandi prices:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get price trends
router.get('/trends/:crop', authenticate, async (req: Request, res: Response) => {
  try {
    const { crop } = req.params;
    
    const trends = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 2500 + Math.random() * 1000,
      volume: Math.floor(1000 + Math.random() * 5000)
    })).reverse();
    
    res.json({ success: true, data: { crop, trends } });
  } catch (error: any) {
    logger.error('Error fetching price trends:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
