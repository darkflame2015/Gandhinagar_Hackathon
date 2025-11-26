import Loan from '../models/Loan.model';
import RiskAssessment from '../models/RiskAssessment.model';
import logger from '../utils/logger';
import axios from 'axios';

// Check and process insurance triggers (cron job)
export const checkInsuranceTriggers = async () => {
  try {
    // Get recent risk assessments with triggered insurance
    const assessments = await RiskAssessment.find({
      'insuranceTriggers.triggered': true,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    for (const assessment of assessments) {
      const loan = await Loan.findOne({ farmerId: assessment.farmerId, status: { $in: ['ACTIVE', 'DISBURSED'] } });
      
      if (loan && loan.insuranceCoverage) {
        for (const trigger of assessment.insuranceTriggers) {
          if (trigger.triggered) {
            await processInsuranceClaim(loan, trigger, assessment);
          }
        }
      }
    }
    
    logger.info(`Processed insurance triggers for ${assessments.length} assessments`);
  } catch (error) {
    logger.error('Error checking insurance triggers:', error);
  }
};

// Process insurance claim
const processInsuranceClaim = async (loan: any, trigger: any, assessment: any) => {
  try {
    logger.info(`Processing insurance claim for loan ${loan.loanId}, trigger: ${trigger.triggerType}`);
    
    // In production, integrate with actual insurance provider API
    const claimData = {
      policyNumber: loan.insuranceCoverage.policyNumber,
      loanId: loan.loanId,
      farmerId: loan.farmerId,
      triggerType: trigger.triggerType,
      triggerValue: trigger.actualValue,
      assessmentId: assessment.assessmentId,
      claimAmount: calculateClaimAmount(loan, trigger),
      timestamp: new Date()
    };
    
    // Simulate API call to insurance provider
    // await axios.post(process.env.INSURANCE_API_URL + '/claims', claimData, {
    //   headers: { 'Authorization': `Bearer ${process.env.INSURANCE_API_KEY}` }
    // });
    
    logger.info(`Insurance claim submitted: ${JSON.stringify(claimData)}`);
    
    return claimData;
  } catch (error) {
    logger.error('Error processing insurance claim:', error);
    throw error;
  }
};

// Calculate claim amount based on trigger type
const calculateClaimAmount = (loan: any, trigger: any) => {
  let claimPercentage = 0;
  
  switch (trigger.triggerType) {
    case 'DROUGHT':
      claimPercentage = trigger.actualValue > 0.8 ? 0.7 : 0.5;
      break;
    case 'FLOOD':
      claimPercentage = trigger.actualValue > 0.7 ? 0.8 : 0.6;
      break;
    case 'CROP_FAILURE':
      claimPercentage = trigger.actualValue < 0.3 ? 0.9 : 0.7;
      break;
    default:
      claimPercentage = 0.5;
  }
  
  return Math.round(loan.insuranceCoverage.coverageAmount * claimPercentage);
};

// Get insurance recommendations for a loan
export const getInsuranceRecommendations = async (loanId: string) => {
  try {
    const loan = await Loan.findOne({ loanId });
    if (!loan) throw new Error('Loan not found');
    
    const assessment = await RiskAssessment.findOne({ farmerId: loan.farmerId }).sort({ createdAt: -1 });
    
    const recommendations = {
      recommended: false,
      coverageAmount: 0,
      premium: 0,
      coverageType: [] as string[],
      reasoning: [] as string[]
    };
    
    if (!assessment) return recommendations;
    
    // Recommend insurance based on risk level
    if (assessment.overallRiskScore > 50) {
      recommendations.recommended = true;
      recommendations.coverageAmount = loan.amount * 0.8;
      recommendations.premium = recommendations.coverageAmount * 0.03; // 3% premium
      
      if (assessment.weatherData.droughtRisk > 0.5) {
        recommendations.coverageType.push('Drought Insurance');
        recommendations.reasoning.push('High drought risk detected in the region');
      }
      
      if (assessment.weatherData.floodRisk > 0.4) {
        recommendations.coverageType.push('Flood Insurance');
        recommendations.reasoning.push('Elevated flood risk due to forecasted heavy rainfall');
      }
      
      if (assessment.satelliteData.vegetationIndex < 0.5) {
        recommendations.coverageType.push('Crop Insurance');
        recommendations.reasoning.push('Current crop health indicators show stress');
      }
      
      if (assessment.marketData.priceVolatility > 0.25) {
        recommendations.coverageType.push('Price Protection');
        recommendations.reasoning.push('High market price volatility detected');
      }
    }
    
    return recommendations;
  } catch (error) {
    logger.error('Error generating insurance recommendations:', error);
    throw error;
  }
};

// Activate insurance coverage
export const activateInsurance = async (loanId: string, coverageType: string[]) => {
  try {
    const loan = await Loan.findOne({ loanId });
    if (!loan) throw new Error('Loan not found');
    
    const recommendations = await getInsuranceRecommendations(loanId);
    
    const insuranceData = {
      provider: 'AgriInsure Co.',
      policyNumber: `POL-${Date.now()}-${loanId}`,
      coverageAmount: recommendations.coverageAmount,
      premium: recommendations.premium,
      coverageType
    };
    
    loan.insuranceCoverage = insuranceData;
    await loan.save();
    
    logger.info(`Insurance activated for loan ${loanId}`);
    
    return insuranceData;
  } catch (error) {
    logger.error('Error activating insurance:', error);
    throw error;
  }
};
