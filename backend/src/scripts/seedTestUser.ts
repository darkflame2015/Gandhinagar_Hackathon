import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Farmer from '../models/Farmer.model';

// Load environment variables from .env file
require('dotenv').config();

const seedTestUser = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agri_lending';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await Farmer.findOne({ email: 'test@farmer.com' });
    
    if (existingUser) {
      console.log('ℹ️  Test user already exists!');
      console.log('📧 Email: test@farmer.com');
      console.log('🔑 Password: Test@123');
      console.log('👤 Farmer ID:', existingUser.farmerId);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Test@123', 10);

    // Create test farmer
    const testFarmer = new Farmer({
      farmerId: 'FARMER001',
      name: 'Test Farmer',
      email: 'test@farmer.com',
      phone: '9876543210',
      password: hashedPassword,
      address: {
        village: 'Test Village',
        district: 'Gandhinagar',
        state: 'Gujarat',
        pincode: '382010',
        coordinates: {
          latitude: 23.2156,
          longitude: 72.6369
        }
      },
      landDetails: {
        totalArea: 5.5,
        soilType: 'Alluvial',
        irrigationType: 'Drip',
        crops: ['Wheat', 'Cotton', 'Rice']
      },
      kycDocuments: {
        aadhaar: '123456789012',
        pan: 'ABCDE1234F',
        landRecords: 'LAND001',
        bankAccount: '1234567890'
      },
      agriStackData: {
        farmerId: 'AGRISTACK001',
        verified: true,
        lastSync: new Date()
      },
      creditScore: 720,
      fpo: 'Gujarat Farmers Cooperative',
      isVerified: true
    });

    await testFarmer.save();

    console.log('✅ Test user created successfully!');
    console.log('\n📝 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    test@farmer.com');
    console.log('🔑 Password: Test@123');
    console.log('👤 Name:     Test Farmer');
    console.log('🆔 ID:       FARMER001');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Login at: http://localhost:3000/login');

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
};

seedTestUser();
