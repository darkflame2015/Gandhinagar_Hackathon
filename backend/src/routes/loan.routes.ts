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

// Apply for loan with instant credit decision
router.post('/apply', authMiddleware, async (req: any, res: Response) => {
  try {
    const { loanType, amount, purpose, cropType, season, tenure } = req.body;
    const startTime = Date.now();

    // Get farmer details
    const farmer: any = db.prepare('SELECT * FROM farmers WHERE id = ?').get(req.farmerId);
    
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    // Calculate credit score (simplified)
    let creditScore = farmer.creditScore || 500;
    
    // Add bonuses
    if (farmer.isVerified) creditScore += 100;
    if (farmer.agriStackVerified) creditScore += 100;
    if (farmer.fpo) creditScore += 50;
    if (farmer.totalArea && farmer.totalArea > 3) creditScore += 50;

    // Calculate risk (simplified)
    const baseRisk = 50;
    const creditRisk = Math.max(0, (750 - creditScore) / 10);
    const amountRisk = amount > 100000 ? 20 : 10;
    const riskScore = Math.min(100, baseRisk + creditRisk + amountRisk);

    // Determine risk level
    let riskLevel = 'LOW';
    if (riskScore > 70) riskLevel = 'HIGH';
    else if (riskScore > 50) riskLevel = 'MEDIUM';

    // Make decision
    let decision = 'PENDING';
    let interestRate = 7.0;

    if (creditScore >= 700 && riskScore < 50) {
      decision = 'APPROVED';
      interestRate = 6.5;
    } else if (creditScore >= 600 && riskScore < 60) {
      decision = 'APPROVED';
      interestRate = 7.5;
    } else if (creditScore >= 550 && riskScore < 40) {
      decision = 'APPROVED';
      interestRate = 8.0;
    } else if (creditScore < 500) {
      decision = 'REJECTED';
    } else {
      decision = 'MANUAL_REVIEW';
    }

    const decisionTime = Math.floor((Date.now() - startTime) / 1000); // seconds

    // Generate loan ID
    const count = db.prepare('SELECT COUNT(*) as count FROM loans').get() as { count: number };
    const loanId = `LOAN${String(count.count + 1).padStart(6, '0')}`;

    // Insert loan
    const stmt = db.prepare(`
      INSERT INTO loans (
        loanId, farmerId, loanType, amount, purpose, cropType, season, tenure,
        interestRate, status, creditScore, riskScore, riskLevel, decision, decisionTime
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      loanId, farmer.id, loanType, amount, purpose, cropType, season, tenure,
      interestRate, decision, creditScore, riskScore, riskLevel, decision, decisionTime
    );

    res.status(201).json({
      message: 'Loan application processed',
      loan: {
        id: result.lastInsertRowid,
        loanId,
        loanType,
        amount,
        status: decision,
        creditDecision: {
          decision,
          creditScore,
          riskScore,
          riskLevel,
          interestRate,
          decisionTime,
          automated: true
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error processing loan', error: error.message });
  }
});

// Get all loans for farmer
router.get('/', authMiddleware, (req: any, res: Response) => {
  try {
    const loans = db.prepare('SELECT * FROM loans WHERE farmerId = ? ORDER BY createdAt DESC').all(req.farmerId);
    res.json({ success: true, data: loans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching loans', error: error.message });
  }
});

// Get all loans for farmer (alternative route)
router.get('/farmer/all', authMiddleware, (req: any, res: Response) => {
  try {
    const loans = db.prepare('SELECT * FROM loans WHERE farmerId = ? ORDER BY createdAt DESC').all(req.farmerId);
    res.json({ success: true, data: loans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching loans', error: error.message });
  }
});

// Get loan by ID
router.get('/:loanId', authMiddleware, (req: any, res: Response) => {
  try {
    const loan: any = db.prepare('SELECT * FROM loans WHERE loanId = ? AND farmerId = ?').get(req.params.loanId, req.farmerId);
    
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    // Get payments
    const payments = db.prepare('SELECT * FROM payments WHERE loanId = ?').all(loan.id);
    
    res.json({ success: true, data: { ...loan, payments } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching loan', error: error.message });
  }
});

export default router;
