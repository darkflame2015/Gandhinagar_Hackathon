import express, { Request, Response } from 'express';
import Loan from '../models/Loan.model';
import Farmer from '../models/Farmer.model';
import RiskAssessment from '../models/RiskAssessment.model';
import { authenticate, authorize } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = express.Router();

// Get portfolio overview
router.get('/portfolio', authenticate, async (req: Request, res: Response) => {
  try {
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: { $in: ['ACTIVE', 'DISBURSED'] } });
    const closedLoans = await Loan.countDocuments({ status: 'CLOSED' });
    const npaLoans = await Loan.countDocuments({ status: 'NPA' });
    
    const totalDisbursed = await Loan.aggregate([
      { $match: { status: { $in: ['ACTIVE', 'DISBURSED', 'CLOSED'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const outstandingAmount = await Loan.aggregate([
      { $match: { status: { $in: ['ACTIVE', 'DISBURSED'] } } },
      { $group: { _id: null, total: { $sum: '$outstandingAmount' } } }
    ]);
    
    const npaAmount = await Loan.aggregate([
      { $match: { status: 'NPA' } },
      { $group: { _id: null, total: { $sum: '$outstandingAmount' } } }
    ]);
    
    const npaRatio = totalDisbursed[0]?.total 
      ? ((npaAmount[0]?.total || 0) / totalDisbursed[0].total) * 100 
      : 0;
    
    const avgDecisionTime = await Loan.aggregate([
      { $match: { 'creditDecision.decisionTime': { $exists: true } } },
      { $project: { 
        decisionTime: { 
          $subtract: ['$creditDecision.decisionTime', '$applicationDate'] 
        } 
      }},
      { $group: { _id: null, avgTime: { $avg: '$decisionTime' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalLoans,
          activeLoans,
          closedLoans,
          npaLoans,
          npaRatio: Math.round(npaRatio * 100) / 100
        },
        financials: {
          totalDisbursed: totalDisbursed[0]?.total || 0,
          outstandingAmount: outstandingAmount[0]?.total || 0,
          npaAmount: npaAmount[0]?.total || 0
        },
        performance: {
          avgDecisionTimeMs: avgDecisionTime[0]?.avgTime || 0,
          avgDecisionTimeMinutes: Math.round((avgDecisionTime[0]?.avgTime || 0) / 1000 / 60 * 100) / 100
        }
      }
    });
  } catch (error: any) {
    logger.error('Error fetching portfolio:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get loan distribution by type
router.get('/loan-distribution', authenticate, async (req: Request, res: Response) => {
  try {
    const distribution = await Loan.aggregate([
      { $group: { 
        _id: '$loanType', 
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    res.json({ success: true, data: distribution });
  } catch (error: any) {
    logger.error('Error fetching loan distribution:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get risk distribution
router.get('/risk-distribution', authenticate, async (req: Request, res: Response) => {
  try {
    const distribution = await RiskAssessment.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { 
        _id: '$farmerId',
        latestRisk: { $first: '$$ROOT' }
      }},
      { $replaceRoot: { newRoot: '$latestRisk' } },
      { $group: {
        _id: '$riskCategory',
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    res.json({ success: true, data: distribution });
  } catch (error: any) {
    logger.error('Error fetching risk distribution:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recent activities
router.get('/recent-activities', authenticate, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const recentLoans = await Loan.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('loanId farmerId amount status loanType createdAt creditDecision');
    
    res.json({ success: true, data: recentLoans });
  } catch (error: any) {
    logger.error('Error fetching recent activities:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get alerts and notifications
router.get('/alerts', authenticate, async (req: Request, res: Response) => {
  try {
    const alerts = [];
    
    // High risk loans
    const highRiskLoans = await Loan.find({ 
      status: { $in: ['ACTIVE', 'DISBURSED'] },
      riskScore: { $gt: 70 }
    }).limit(10);
    
    alerts.push(...highRiskLoans.map(loan => ({
      type: 'HIGH_RISK',
      severity: 'warning',
      message: `Loan ${loan.loanId} has high risk score: ${loan.riskScore}`,
      loanId: loan.loanId,
      timestamp: new Date()
    })));
    
    // Overdue payments
    const now = new Date();
    const overdueLoans = await Loan.find({
      status: 'ACTIVE',
      'repaymentSchedule.dueDate': { $lt: now },
      'repaymentSchedule.paid': false
    }).limit(10);
    
    alerts.push(...overdueLoans.map(loan => ({
      type: 'OVERDUE',
      severity: 'error',
      message: `Loan ${loan.loanId} has overdue payments`,
      loanId: loan.loanId,
      timestamp: new Date()
    })));
    
    // Insurance triggers
    const triggeredInsurance = await RiskAssessment.find({
      'insuranceTriggers.triggered': true,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).limit(10);
    
    alerts.push(...triggeredInsurance.map(assessment => ({
      type: 'INSURANCE_TRIGGER',
      severity: 'info',
      message: `Insurance triggered for farmer ${assessment.farmerId}`,
      farmerId: assessment.farmerId,
      timestamp: assessment.createdAt
    })));
    
    res.json({ success: true, data: alerts });
  } catch (error: any) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
