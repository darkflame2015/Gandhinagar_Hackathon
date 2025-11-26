import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import db from '../database/db';

const router = Router();

// Auth middleware
const authMiddleware = (req: any, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.farmerId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Generate 15-day forward risk assessment
router.post('/assess', authMiddleware, async (req: any, res: Response) => {
  try {
    const farmer: any = db.prepare('SELECT * FROM farmers WHERE id = ?').get(req.farmerId);
    
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    // Generate mock 15-day predictions
    const forwardPredictions = [];
    const today = new Date();
    
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Simulate varying risk levels
      const baseRisk = 30 + Math.random() * 30;
      const weatherFactor = Math.random() * 20;
      const marketFactor = Math.random() * 15;
      const satelliteFactor = Math.random() * 10;
      
      const dayRisk = Math.min(100, baseRisk + weatherFactor);
      
      forwardPredictions.push({
        day: i + 1,
        date: date.toISOString().split('T')[0],
        riskScore: Math.round(dayRisk * 10) / 10,
        weatherRisk: Math.round((baseRisk + weatherFactor) * 10) / 10,
        marketRisk: Math.round((baseRisk + marketFactor) * 10) / 10,
        satelliteRisk: Math.round((baseRisk + satelliteFactor) * 10) / 10,
        riskLevel: dayRisk > 60 ? 'HIGH' : dayRisk > 40 ? 'MEDIUM' : 'LOW'
      });
    }

    // Overall risk metrics
    const avgRisk = forwardPredictions.reduce((sum, p) => sum + p.riskScore, 0) / 15;
    const weatherRisk = 45 + Math.random() * 20;
    const marketRisk = 40 + Math.random() * 25;
    const satelliteRisk = 35 + Math.random() * 20;
    const riskLevel = avgRisk > 60 ? 'HIGH' : avgRisk > 40 ? 'MEDIUM' : 'LOW';

    // Weather data (mock)
    const weatherData = {
      rainfall: Math.round(Math.random() * 50),
      temperature: 25 + Math.round(Math.random() * 10),
      humidity: 60 + Math.round(Math.random() * 25),
      droughtRisk: Math.round(Math.random() * 100) / 100,
      floodRisk: Math.round(Math.random() * 100) / 100
    };

    // Satellite data (mock)
    const satelliteData = {
      ndvi: 0.4 + Math.round(Math.random() * 40) / 100,
      soilMoisture: 30 + Math.round(Math.random() * 40),
      cropHealth: 'Good'
    };

    // Market data (mock)
    const marketVolatility = Math.round(Math.random() * 50) / 100;

    // Mitigation actions
    const mitigationActions = [];
    if (weatherData.droughtRisk > 0.6) {
      mitigationActions.push({
        action: 'Implement water conservation measures',
        priority: 'HIGH',
        automated: true
      });
    }
    if (weatherData.floodRisk > 0.5) {
      mitigationActions.push({
        action: 'Prepare drainage systems',
        priority: 'MEDIUM',
        automated: false
      });
    }
    if (satelliteData.ndvi < 0.5) {
      mitigationActions.push({
        action: 'Consider fertilizer application',
        priority: 'MEDIUM',
        automated: false
      });
    }

    // Insurance triggers
    const insuranceTriggers = [];
    if (weatherData.droughtRisk > 0.6) {
      insuranceTriggers.push({
        type: 'DROUGHT',
        severity: 'HIGH',
        threshold: 0.6,
        currentValue: weatherData.droughtRisk,
        triggered: true
      });
    }
    if (weatherData.floodRisk > 0.5) {
      insuranceTriggers.push({
        type: 'FLOOD',
        severity: 'MEDIUM',
        threshold: 0.5,
        currentValue: weatherData.floodRisk,
        triggered: true
      });
    }

    // Save assessment
    const stmt = db.prepare(`
      INSERT INTO risk_assessments (
        farmerId, overallRisk, weatherRisk, marketRisk, satelliteRisk, riskLevel,
        rainfall, temperature, droughtRisk, floodRisk,
        ndvi, soilMoisture, cropHealth, marketVolatility,
        forwardPredictions, mitigationActions, insuranceTriggers
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      farmer.id, avgRisk, weatherRisk, marketRisk, satelliteRisk, riskLevel,
      weatherData.rainfall, weatherData.temperature, weatherData.droughtRisk, weatherData.floodRisk,
      satelliteData.ndvi, satelliteData.soilMoisture, satelliteData.cropHealth, marketVolatility,
      JSON.stringify(forwardPredictions),
      JSON.stringify(mitigationActions),
      JSON.stringify(insuranceTriggers)
    );

    res.json({
      success: true,
      message: 'Risk assessment completed',
      data: {
        assessmentId: result.lastInsertRowid,
        farmerId: farmer.farmerId,
        overallRiskScore: Math.round(avgRisk * 10) / 10,
        riskCategory: riskLevel,
        weatherData: {
          ...weatherData,
          humidity: 60 + Math.random() * 30
        },
        satelliteData,
        marketData: {
          volatility: marketVolatility
        },
        forwardRisk: forwardPredictions,
        mitigationActions,
        insuranceTriggers,
        assessmentDate: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error generating risk assessment', error: error.message });
  }
});

// Get latest risk assessment
router.get('/latest/:farmerId', authMiddleware, (req: any, res: Response) => {
  try {
    const { farmerId } = req.params;
    const assessment: any = db.prepare(
      'SELECT * FROM risk_assessments WHERE farmerId = ? ORDER BY createdAt DESC LIMIT 1'
    ).get(req.farmerId);
    
    if (!assessment) {
      return res.status(404).json({ 
        success: false,
        message: 'No risk assessment found. Generate one first.' 
      });
    }

    // Parse JSON fields
    const forwardPredictions = JSON.parse(assessment.forwardPredictions);
    const mitigationActions = JSON.parse(assessment.mitigationActions);
    const insuranceTriggers = JSON.parse(assessment.insuranceTriggers);

    res.json({ 
      success: true,
      data: {
        assessmentId: assessment.id,
        farmerId: assessment.farmerId,
        overallRiskScore: assessment.overallRisk,
        riskCategory: assessment.riskLevel,
        weatherData: {
          rainfall: assessment.rainfall,
          temperature: assessment.temperature,
          humidity: 60 + Math.random() * 30,
          droughtRisk: assessment.droughtRisk,
          floodRisk: assessment.floodRisk
        },
        satelliteData: {
          ndvi: assessment.ndvi,
          soilMoisture: assessment.soilMoisture,
          cropHealth: assessment.cropHealth
        },
        marketData: {
          volatility: assessment.marketVolatility
        },
        forwardRisk: forwardPredictions,
        mitigationActions,
        insuranceTriggers,
        assessmentDate: assessment.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching assessment', error: error.message });
  }
});

export default router;
