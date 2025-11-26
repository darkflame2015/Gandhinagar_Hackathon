import Loan from '../models/Loan.model';
import Farmer from '../models/Farmer.model';
import RiskAssessment from '../models/RiskAssessment.model';
import { generate15DayRiskForecast } from './risk.service';
import logger from '../utils/logger';

// Credit decisioning - Target: < 30 minutes (instant automated decision)
export const performCreditDecision = async (loanId: string) => {
  const startTime = Date.now();
  
  try {
    const loan = await Loan.findOne({ loanId });
    if (!loan) throw new Error('Loan not found');
    
    const farmer = await Farmer.findOne({ farmerId: loan.farmerId });
    if (!farmer) throw new Error('Farmer not found');
    
    // Step 1: Generate risk assessment (includes weather, satellite, market data)
    const riskAssessment = await generate15DayRiskForecast(loan.farmerId, loanId);
    
    // Step 2: Calculate credit score based on multiple factors
    const creditScore = await calculateCreditScore(farmer, loan, riskAssessment);
    
    // Step 3: Make automated decision
    const decision = makeDecision(creditScore, riskAssessment, loan);
    
    // Step 4: Update loan with decision
    const decisionTime = Date.now() - startTime;
    
    loan.creditDecision = {
      decision: decision.approved ? 'APPROVED' : 'REJECTED',
      score: creditScore,
      riskLevel: riskAssessment.riskCategory,
      decisionTime: new Date(),
      automated: true,
      reasons: decision.reasons
    };
    
    loan.status = decision.approved ? 'APPROVED' : 'REJECTED';
    loan.riskScore = riskAssessment.overallRiskScore;
    
    await loan.save();
    
    logger.info(`Credit decision completed in ${decisionTime}ms for loan ${loanId}: ${decision.approved ? 'APPROVED' : 'REJECTED'}`);
    
    return {
      ...loan.toObject(),
      decisionTimeMs: decisionTime,
      decisionTimeMinutes: Math.round(decisionTime / 1000 / 60 * 100) / 100
    };
    
  } catch (error) {
    logger.error('Error in credit decisioning:', error);
    throw error;
  }
};

// Calculate comprehensive credit score
const calculateCreditScore = async (farmer: any, loan: any, riskAssessment: any) => {
  let score = 500; // Base score
  
  // 1. Farmer verification (0-100 points)
  if (farmer.isVerified) score += 50;
  if (farmer.kycDocuments.aadhaar) score += 20;
  if (farmer.kycDocuments.pan) score += 15;
  if (farmer.kycDocuments.landRecords) score += 15;
  
  // 2. Agri Stack data (0-100 points)
  if (farmer.agriStackData?.verified) {
    score += 100;
  } else {
    score += 30;
  }
  
  // 3. Land size and quality (0-80 points)
  if (farmer.landDetails.totalArea > 10) score += 40;
  else if (farmer.landDetails.totalArea > 5) score += 30;
  else if (farmer.landDetails.totalArea > 2) score += 20;
  
  if (farmer.landDetails.irrigationType === 'Drip' || farmer.landDetails.irrigationType === 'Sprinkler') {
    score += 20;
  } else if (farmer.landDetails.irrigationType === 'Canal') {
    score += 15;
  }
  
  // 4. Risk assessment (0-150 points, inversely related to risk)
  const riskPenalty = Math.round(riskAssessment.overallRiskScore * 1.5);
  score += (150 - riskPenalty);
  
  // 5. Alternative data (0-70 points)
  score += Math.round(riskAssessment.alternativeData.agriStackScore * 20);
  score += Math.round(riskAssessment.alternativeData.digitalFootprint * 20);
  score += Math.round(riskAssessment.alternativeData.communityRating * 30);
  
  // 6. FPO/JLG membership (0-50 points)
  if (farmer.fpo) score += 50;
  
  // 7. Loan-to-value ratio (0-50 points)
  const ltv = loan.amount / (farmer.landDetails.totalArea * 50000); // Assuming 50k per acre
  if (ltv < 0.5) score += 50;
  else if (ltv < 0.7) score += 35;
  else if (ltv < 0.9) score += 20;
  
  // Cap score at 900
  return Math.min(score, 900);
};

// Make automated credit decision
const makeDecision = (creditScore: number, riskAssessment: any, loan: any) => {
  const reasons = [];
  let approved = false;
  
  // Decision matrix
  if (creditScore >= 700 && riskAssessment.overallRiskScore < 50) {
    approved = true;
    reasons.push('Excellent credit score and low risk profile');
  } else if (creditScore >= 600 && riskAssessment.overallRiskScore < 60) {
    approved = true;
    reasons.push('Good credit score with acceptable risk level');
  } else if (creditScore >= 550 && riskAssessment.overallRiskScore < 40) {
    approved = true;
    reasons.push('Moderate credit score but low risk indicators');
  } else {
    // Rejections
    if (creditScore < 500) {
      reasons.push('Credit score below minimum threshold');
    }
    if (riskAssessment.overallRiskScore > 70) {
      reasons.push('High risk level detected in forward risk analysis');
    }
    if (riskAssessment.weatherData.droughtRisk > 0.8) {
      reasons.push('Critical drought risk in region');
    }
    if (riskAssessment.satelliteData.vegetationIndex < 0.3) {
      reasons.push('Poor crop health indicators from satellite data');
    }
  }
  
  // Conditional approval for group lending
  if (!approved && loan.loanType === 'GROUP_LENDING' && creditScore >= 500) {
    approved = true;
    reasons.push('Approved under group lending scheme with lower threshold');
  }
  
  return { approved, reasons };
};

// Generate repayment schedule
export const generateRepaymentSchedule = async (loanId: string) => {
  try {
    const loan = await Loan.findOne({ loanId });
    if (!loan) throw new Error('Loan not found');
    
    const farmer = await Farmer.findOne({ farmerId: loan.farmerId });
    if (!farmer) throw new Error('Farmer not found');
    
    const schedule = [];
    const monthlyRate = loan.interestRate / 12 / 100;
    
    if (loan.loanType === 'CROP_LOAN') {
      // Seasonal repayment - bullet payment at harvest
      const harvestMonths = loan.season === 'Kharif' ? 6 : 4;
      const totalAmount = loan.amount * (1 + loan.interestRate / 100);
      
      schedule.push({
        dueDate: new Date(Date.now() + harvestMonths * 30 * 24 * 60 * 60 * 1000),
        amount: totalAmount,
        principal: loan.amount,
        interest: totalAmount - loan.amount,
        paid: false
      });
    } else {
      // Regular EMI schedule
      const emi = calculateEMI(loan.amount, monthlyRate, loan.tenure);
      
      for (let month = 1; month <= loan.tenure; month++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + month);
        
        const interest = loan.outstandingAmount * monthlyRate;
        const principal = emi - interest;
        
        schedule.push({
          dueDate,
          amount: Math.round(emi),
          principal: Math.round(principal),
          interest: Math.round(interest),
          paid: false
        });
      }
    }
    
    loan.repaymentSchedule = schedule;
    loan.outstandingAmount = loan.amount;
    await loan.save();
    
    return schedule;
  } catch (error) {
    logger.error('Error generating repayment schedule:', error);
    throw error;
  }
};

// Calculate EMI
const calculateEMI = (principal: number, monthlyRate: number, tenure: number) => {
  if (monthlyRate === 0) return principal / tenure;
  return principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
};

// Disburse loan
export const disburseLoan = async (loanId: string, accountNumber: string) => {
  try {
    const loan = await Loan.findOne({ loanId });
    if (!loan) throw new Error('Loan not found');
    
    if (loan.status !== 'APPROVED') {
      throw new Error('Loan must be approved before disbursement');
    }
    
    // In production, integrate with payment gateway
    const transactionId = `TXN-${Date.now()}-${loanId}`;
    
    loan.disbursement = {
      date: new Date(),
      method: 'Bank Transfer',
      accountNumber,
      transactionId
    };
    
    loan.status = 'DISBURSED';
    await loan.save();
    
    // Generate repayment schedule after disbursement
    await generateRepaymentSchedule(loanId);
    
    logger.info(`Loan disbursed: ${loanId}, Amount: ${loan.amount}, TxnId: ${transactionId}`);
    
    return loan;
  } catch (error) {
    logger.error('Error disbursing loan:', error);
    throw error;
  }
};

// Process payment
export const processPayment = async (loanId: string, amount: number, paymentDate: Date) => {
  try {
    const loan = await Loan.findOne({ loanId });
    if (!loan) throw new Error('Loan not found');
    
    let remainingAmount = amount;
    
    // Apply payment to due installments
    for (const installment of loan.repaymentSchedule) {
      if (!installment.paid && remainingAmount > 0) {
        if (remainingAmount >= installment.amount) {
          installment.paid = true;
          installment.paidDate = paymentDate;
          remainingAmount -= installment.amount;
          loan.outstandingAmount -= installment.principal;
        }
      }
    }
    
    // Check if loan is fully paid
    const allPaid = loan.repaymentSchedule.every(inst => inst.paid);
    if (allPaid) {
      loan.status = 'CLOSED';
    } else {
      loan.status = 'ACTIVE';
    }
    
    await loan.save();
    
    logger.info(`Payment processed for loan ${loanId}: ${amount}`);
    
    return loan;
  } catch (error) {
    logger.error('Error processing payment:', error);
    throw error;
  }
};

// Check for NPAs
export const checkNPAs = async () => {
  try {
    const loans = await Loan.find({ status: 'ACTIVE' });
    const now = new Date();
    
    for (const loan of loans) {
      let overdueDays = 0;
      
      for (const installment of loan.repaymentSchedule) {
        if (!installment.paid && installment.dueDate < now) {
          const daysDiff = Math.floor((now.getTime() - installment.dueDate.getTime()) / (1000 * 60 * 60 * 24));
          overdueDays = Math.max(overdueDays, daysDiff);
        }
      }
      
      // Mark as NPA if overdue > 90 days
      if (overdueDays > 90 && loan.status !== 'NPA') {
        loan.status = 'NPA';
        await loan.save();
        logger.warn(`Loan ${loan.loanId} marked as NPA (overdue: ${overdueDays} days)`);
      }
    }
  } catch (error) {
    logger.error('Error checking NPAs:', error);
  }
};
