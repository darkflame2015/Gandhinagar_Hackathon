import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmer extends Document {
  farmerId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  address: {
    village: string;
    district: string;
    state: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  landDetails: {
    totalArea: number; // in acres
    soilType: string;
    irrigationType: string;
    crops: string[];
  };
  kycDocuments: {
    aadhaar?: string;
    pan?: string;
    landRecords?: string;
    bankAccount?: string;
  };
  agriStackData?: {
    farmerId: string;
    verified: boolean;
    lastSync: Date;
  };
  creditScore?: number;
  fpo?: string; // FPO/JLG membership
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerSchema = new Schema({
  farmerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  address: {
    village: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  landDetails: {
    totalArea: { type: Number, required: true },
    soilType: String,
    irrigationType: String,
    crops: [String]
  },
  kycDocuments: {
    aadhaar: String,
    pan: String,
    landRecords: String,
    bankAccount: String
  },
  agriStackData: {
    farmerId: String,
    verified: { type: Boolean, default: false },
    lastSync: Date
  },
  creditScore: { type: Number, default: 0 },
  fpo: String,
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model<IFarmer>('Farmer', FarmerSchema);
