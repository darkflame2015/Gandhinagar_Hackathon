import mongoose, { Schema, Document } from 'mongoose';

export interface ILoan extends Document {
  loanId: string;
  farmerId: string;
  loanType: 'KCC' | 'CROP_LOAN' | 'ASSET_FINANCE' | 'GROUP_LENDING';
  amount: number;
  purpose: string;
  cropType?: string;
  season?: string;
  tenure: number; // in months
  interestRate: number;
  status: 'PENDING' | 'APPROVED' | 'DISBURSED' | 'ACTIVE' | 'CLOSED' | 'REJECTED' | 'NPA';
  
  // Origination
  applicationDate: Date;
  documents: {
    type: string;
    url: string;
    verified: boolean;
  }[];
  
  // Underwriting
  creditDecision?: {
    decision: 'APPROVED' | 'REJECTED' | 'PENDING';
    score: number;
    riskLevel: string;
    decisionTime: Date;
    automated: boolean;
    reasons?: string[];
  };
  
  // Disbursement
  disbursement?: {
    date: Date;
    method: string;
    accountNumber: string;
    transactionId: string;
  };
  
  // Repayment
  repaymentSchedule: {
    dueDate: Date;
    amount: number;
    principal: number;
    interest: number;
    paid: boolean;
    paidDate?: Date;
  }[];
  
  outstandingAmount: number;
  collateral?: string;
  guarantor?: string;
  
  // Monitoring
  riskScore: number;
  insuranceCoverage?: {
    provider: string;
    policyNumber: string;
    coverageAmount: number;
    premium: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema({
  loanId: { type: String, required: true, unique: true },
  farmerId: { type: String, required: true, ref: 'Farmer' },
  loanType: { 
    type: String, 
    enum: ['KCC', 'CROP_LOAN', 'ASSET_FINANCE', 'GROUP_LENDING'],
    required: true 
  },
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  cropType: String,
  season: String,
  tenure: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'DISBURSED', 'ACTIVE', 'CLOSED', 'REJECTED', 'NPA'],
    default: 'PENDING'
  },
  applicationDate: { type: Date, default: Date.now },
  documents: [{
    type: { type: String },
    url: String,
    verified: { type: Boolean, default: false }
  }],
  creditDecision: {
    decision: { type: String, enum: ['APPROVED', 'REJECTED', 'PENDING'] },
    score: Number,
    riskLevel: String,
    decisionTime: Date,
    automated: { type: Boolean, default: true },
    reasons: [String]
  },
  disbursement: {
    date: Date,
    method: String,
    accountNumber: String,
    transactionId: String
  },
  repaymentSchedule: [{
    dueDate: Date,
    amount: Number,
    principal: Number,
    interest: Number,
    paid: { type: Boolean, default: false },
    paidDate: Date
  }],
  outstandingAmount: Number,
  collateral: String,
  guarantor: String,
  riskScore: { type: Number, default: 0 },
  insuranceCoverage: {
    provider: String,
    policyNumber: String,
    coverageAmount: Number,
    premium: Number
  }
}, {
  timestamps: true
});

export default mongoose.model<ILoan>('Loan', LoanSchema);
