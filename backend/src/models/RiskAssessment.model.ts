import mongoose, { Schema, Document } from 'mongoose';

export interface IRiskAssessment extends Document {
  assessmentId: string;
  farmerId: string;
  loanId?: string;
  assessmentDate: Date;
  
  // 15-day forward predictions
  forwardRisk: {
    day: number;
    date: Date;
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: {
      weather: number;
      market: number;
      satellite: number;
      seasonal: number;
    };
  }[];
  
  // Weather risk
  weatherData: {
    rainfall: number;
    temperature: number;
    humidity: number;
    extremeEvents: string[];
    droughtRisk: number;
    floodRisk: number;
  };
  
  // Satellite imagery analysis
  satelliteData: {
    vegetationIndex: number; // NDVI
    soilMoisture: number;
    cropHealth: string;
    imageDate: Date;
    anomalies: string[];
  };
  
  // Market signals
  marketData: {
    cropPrices: { crop: string; price: number; trend: string }[];
    priceVolatility: number;
    demandSupply: string;
  };
  
  // Alternative data
  alternativeData: {
    agriStackScore: number;
    digitalFootprint: number;
    socialScore: number;
    communityRating: number;
  };
  
  // Overall risk
  overallRiskScore: number;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // Mitigation recommendations
  mitigationActions: {
    action: string;
    priority: string;
    automated: boolean;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }[];
  
  // Insurance triggers
  insuranceTriggers: {
    triggered: boolean;
    triggerType: string;
    threshold: number;
    actualValue: number;
    action: string;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

const RiskAssessmentSchema = new Schema({
  assessmentId: { type: String, required: true, unique: true },
  farmerId: { type: String, required: true, ref: 'Farmer' },
  loanId: { type: String, ref: 'Loan' },
  assessmentDate: { type: Date, default: Date.now },
  
  forwardRisk: [{
    day: Number,
    date: Date,
    riskScore: Number,
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    factors: {
      weather: Number,
      market: Number,
      satellite: Number,
      seasonal: Number
    }
  }],
  
  weatherData: {
    rainfall: Number,
    temperature: Number,
    humidity: Number,
    extremeEvents: [String],
    droughtRisk: Number,
    floodRisk: Number
  },
  
  satelliteData: {
    vegetationIndex: Number,
    soilMoisture: Number,
    cropHealth: String,
    imageDate: Date,
    anomalies: [String]
  },
  
  marketData: {
    cropPrices: [{ crop: String, price: Number, trend: String }],
    priceVolatility: Number,
    demandSupply: String
  },
  
  alternativeData: {
    agriStackScore: Number,
    digitalFootprint: Number,
    socialScore: Number,
    communityRating: Number
  },
  
  overallRiskScore: { type: Number, required: true },
  riskCategory: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
  
  mitigationActions: [{
    action: String,
    priority: String,
    automated: Boolean,
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'PENDING' }
  }],
  
  insuranceTriggers: [{
    triggered: Boolean,
    triggerType: String,
    threshold: Number,
    actualValue: Number,
    action: String
  }]
}, {
  timestamps: true
});

export default mongoose.model<IRiskAssessment>('RiskAssessment', RiskAssessmentSchema);
