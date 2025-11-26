import axios from 'axios';
import RiskAssessment from '../models/RiskAssessment.model';
import Farmer from '../models/Farmer.model';
import Loan from '../models/Loan.model';
import logger from '../utils/logger';

// Generate 15-day forward risk predictions
export const generate15DayRiskForecast = async (farmerId: string, loanId?: string) => {
  try {
    const farmer = await Farmer.findOne({ farmerId });
    if (!farmer) throw new Error('Farmer not found');

    // Fetch weather data
    const weatherData = await fetchWeatherData(farmer.address.coordinates);
    
    // Fetch satellite imagery data
    const satelliteData = await fetchSatelliteData(farmer.address.coordinates);
    
    // Fetch market signals
    const marketData = await fetchMarketData(farmer.landDetails.crops);
    
    // Get alternative data
    const alternativeData = await getAlternativeData(farmerId);

    // Generate 15-day forward predictions
    const forwardRisk = [];
    for (let day = 1; day <= 15; day++) {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() + day);
      
      const dayRisk = calculateDayRisk(
        weatherData.forecast[day - 1],
        marketData,
        satelliteData,
        day
      );
      
      forwardRisk.push({
        day,
        date: dayDate,
        riskScore: dayRisk.score,
        riskLevel: dayRisk.level,
        factors: dayRisk.factors
      });
    }

    // Calculate overall risk score
    const overallRiskScore = calculateOverallRisk(forwardRisk, weatherData, satelliteData, marketData, alternativeData);
    const riskCategory = getRiskCategory(overallRiskScore);

    // Generate mitigation recommendations
    const mitigationActions = generateMitigationActions(overallRiskScore, weatherData, satelliteData, marketData);
    
    // Check insurance triggers
    const insuranceTriggers = checkInsuranceConditions(weatherData, satelliteData, overallRiskScore);

    // Create risk assessment
    const assessment = new RiskAssessment({
      assessmentId: `RISK-${Date.now()}-${farmerId}`,
      farmerId,
      loanId,
      assessmentDate: new Date(),
      forwardRisk,
      weatherData: {
        rainfall: weatherData.current.rainfall,
        temperature: weatherData.current.temperature,
        humidity: weatherData.current.humidity,
        extremeEvents: weatherData.extremeEvents,
        droughtRisk: weatherData.droughtRisk,
        floodRisk: weatherData.floodRisk
      },
      satelliteData,
      marketData,
      alternativeData,
      overallRiskScore,
      riskCategory,
      mitigationActions,
      insuranceTriggers
    });

    await assessment.save();
    logger.info(`Risk assessment created: ${assessment.assessmentId}`);
    
    return assessment;
  } catch (error) {
    logger.error('Error generating risk forecast:', error);
    throw error;
  }
};

// Fetch weather data from external API
const fetchWeatherData = async (coordinates: any) => {
  try {
    // Simulated weather API call - replace with actual API
    const lat = coordinates?.latitude || 23.0225;
    const lon = coordinates?.longitude || 72.5714;
    
    // In production, use actual weather API
    const current = {
      rainfall: Math.random() * 100,
      temperature: 25 + Math.random() * 15,
      humidity: 60 + Math.random() * 30,
    };
    
    const forecast = Array.from({ length: 15 }, (_, i) => ({
      day: i + 1,
      rainfall: Math.random() * 100,
      temperature: 25 + Math.random() * 15,
      humidity: 60 + Math.random() * 30,
      windSpeed: Math.random() * 30
    }));
    
    return {
      current,
      forecast,
      extremeEvents: forecast.filter(f => f.rainfall > 80).map(f => `Heavy rainfall on day ${f.day}`),
      droughtRisk: forecast.filter(f => f.rainfall < 10).length > 5 ? 0.7 : 0.3,
      floodRisk: forecast.filter(f => f.rainfall > 80).length > 3 ? 0.6 : 0.2
    };
  } catch (error) {
    logger.error('Error fetching weather data:', error);
    return getDefaultWeatherData();
  }
};

// Fetch satellite imagery data
const fetchSatelliteData = async (coordinates: any) => {
  try {
    // Simulated satellite data - replace with actual Sentinel/Landsat API
    return {
      vegetationIndex: 0.6 + Math.random() * 0.3, // NDVI 0.6-0.9
      soilMoisture: 0.3 + Math.random() * 0.4,
      cropHealth: Math.random() > 0.7 ? 'Good' : Math.random() > 0.4 ? 'Moderate' : 'Poor',
      imageDate: new Date(),
      anomalies: Math.random() > 0.8 ? ['Low vegetation detected'] : []
    };
  } catch (error) {
    logger.error('Error fetching satellite data:', error);
    return {
      vegetationIndex: 0.7,
      soilMoisture: 0.5,
      cropHealth: 'Moderate',
      imageDate: new Date(),
      anomalies: []
    };
  }
};

// Fetch market data
const fetchMarketData = async (crops: string[]) => {
  try {
    // Simulated market data - replace with actual mandi API
    const cropPrices = crops.map(crop => ({
      crop,
      price: 2000 + Math.random() * 3000,
      trend: Math.random() > 0.5 ? 'UP' : 'DOWN'
    }));
    
    return {
      cropPrices,
      priceVolatility: Math.random() * 0.3,
      demandSupply: Math.random() > 0.5 ? 'Balanced' : 'Oversupply'
    };
  } catch (error) {
    logger.error('Error fetching market data:', error);
    return {
      cropPrices: [],
      priceVolatility: 0.15,
      demandSupply: 'Balanced'
    };
  }
};

// Get alternative data scores
const getAlternativeData = async (farmerId: string) => {
  try {
    const farmer = await Farmer.findOne({ farmerId });
    
    return {
      agriStackScore: farmer?.agriStackData?.verified ? 0.8 : 0.5,
      digitalFootprint: Math.random() * 0.5 + 0.5,
      socialScore: Math.random() * 0.5 + 0.5,
      communityRating: Math.random() * 0.5 + 0.5
    };
  } catch (error) {
    logger.error('Error getting alternative data:', error);
    return {
      agriStackScore: 0.5,
      digitalFootprint: 0.5,
      socialScore: 0.5,
      communityRating: 0.5
    };
  }
};

// Calculate daily risk
const calculateDayRisk = (weatherForecast: any, marketData: any, satelliteData: any, day: number) => {
  const weatherRisk = (weatherForecast.rainfall > 80 ? 0.8 : weatherForecast.rainfall < 10 ? 0.6 : 0.3);
  const marketRisk = marketData.priceVolatility;
  const satelliteRisk = satelliteData.vegetationIndex < 0.5 ? 0.7 : 0.3;
  const seasonalRisk = Math.sin(day / 15 * Math.PI) * 0.2 + 0.3;
  
  const score = (weatherRisk * 0.4 + marketRisk * 0.3 + satelliteRisk * 0.2 + seasonalRisk * 0.1);
  
  return {
    score: Math.round(score * 100),
    level: score > 0.7 ? 'CRITICAL' : score > 0.5 ? 'HIGH' : score > 0.3 ? 'MEDIUM' : 'LOW',
    factors: {
      weather: Math.round(weatherRisk * 100),
      market: Math.round(marketRisk * 100),
      satellite: Math.round(satelliteRisk * 100),
      seasonal: Math.round(seasonalRisk * 100)
    }
  };
};

// Calculate overall risk score
const calculateOverallRisk = (forwardRisk: any[], weatherData: any, satelliteData: any, marketData: any, alternativeData: any) => {
  const avgForwardRisk = forwardRisk.reduce((sum, day) => sum + day.riskScore, 0) / forwardRisk.length;
  const weatherScore = (weatherData.droughtRisk + weatherData.floodRisk) * 50;
  const satelliteScore = (1 - satelliteData.vegetationIndex) * 100;
  const marketScore = marketData.priceVolatility * 100;
  const altDataScore = (1 - (alternativeData.agriStackScore + alternativeData.digitalFootprint) / 2) * 100;
  
  return Math.round((avgForwardRisk * 0.4 + weatherScore * 0.25 + satelliteScore * 0.15 + marketScore * 0.1 + altDataScore * 0.1));
};

// Get risk category
const getRiskCategory = (score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
  if (score > 75) return 'CRITICAL';
  if (score > 50) return 'HIGH';
  if (score > 30) return 'MEDIUM';
  return 'LOW';
};

// Generate mitigation actions
const generateMitigationActions = (riskScore: number, weatherData: any, satelliteData: any, marketData: any) => {
  const actions = [];
  
  if (weatherData.droughtRisk > 0.6) {
    actions.push({
      action: 'Activate drought insurance coverage',
      priority: 'HIGH',
      automated: true,
      status: 'PENDING'
    });
    actions.push({
      action: 'Recommend drip irrigation installation',
      priority: 'MEDIUM',
      automated: false,
      status: 'PENDING'
    });
  }
  
  if (weatherData.floodRisk > 0.5) {
    actions.push({
      action: 'Trigger flood insurance claim',
      priority: 'CRITICAL',
      automated: true,
      status: 'PENDING'
    });
  }
  
  if (satelliteData.vegetationIndex < 0.5) {
    actions.push({
      action: 'Alert for crop health monitoring',
      priority: 'HIGH',
      automated: true,
      status: 'PENDING'
    });
  }
  
  if (marketData.priceVolatility > 0.25) {
    actions.push({
      action: 'Suggest forward contract with mandis',
      priority: 'MEDIUM',
      automated: false,
      status: 'PENDING'
    });
  }
  
  if (riskScore > 70) {
    actions.push({
      action: 'Restructure loan repayment schedule',
      priority: 'HIGH',
      automated: false,
      status: 'PENDING'
    });
  }
  
  return actions;
};

// Check insurance trigger conditions
const checkInsuranceConditions = (weatherData: any, satelliteData: any, riskScore: number) => {
  const triggers = [];
  
  // Drought trigger
  if (weatherData.droughtRisk > 0.6) {
    triggers.push({
      triggered: true,
      triggerType: 'DROUGHT',
      threshold: 0.6,
      actualValue: weatherData.droughtRisk,
      action: 'Initiate drought insurance payout'
    });
  }
  
  // Flood trigger
  if (weatherData.floodRisk > 0.5) {
    triggers.push({
      triggered: true,
      triggerType: 'FLOOD',
      threshold: 0.5,
      actualValue: weatherData.floodRisk,
      action: 'Initiate flood insurance payout'
    });
  }
  
  // Crop failure trigger (based on NDVI)
  if (satelliteData.vegetationIndex < 0.4) {
    triggers.push({
      triggered: true,
      triggerType: 'CROP_FAILURE',
      threshold: 0.4,
      actualValue: satelliteData.vegetationIndex,
      action: 'Initiate crop insurance payout'
    });
  }
  
  return triggers;
};

// Update risk scores for all active loans (cron job)
export const updateRiskScores = async () => {
  try {
    const activeLoans = await Loan.find({ status: { $in: ['ACTIVE', 'DISBURSED'] } });
    
    for (const loan of activeLoans) {
      await generate15DayRiskForecast(loan.farmerId, loan.loanId);
    }
    
    logger.info(`Updated risk scores for ${activeLoans.length} active loans`);
  } catch (error) {
    logger.error('Error updating risk scores:', error);
  }
};

// Get default weather data
const getDefaultWeatherData = () => ({
  current: { rainfall: 50, temperature: 30, humidity: 70 },
  forecast: Array(15).fill({ rainfall: 50, temperature: 30, humidity: 70, windSpeed: 10 }),
  extremeEvents: [],
  droughtRisk: 0.3,
  floodRisk: 0.2
});
