import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

// Create database file in backend directory
const dbPath = path.join(__dirname, '../../agrilend.db');
const db: Database.Database = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
export const initializeDatabase = () => {
  // Farmers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS farmers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmerId TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password TEXT NOT NULL,
      village TEXT,
      district TEXT,
      state TEXT,
      pincode TEXT,
      latitude REAL,
      longitude REAL,
      totalArea REAL,
      soilType TEXT,
      irrigationType TEXT,
      crops TEXT,
      aadhaar TEXT,
      pan TEXT,
      landRecords TEXT,
      bankAccount TEXT,
      agriStackId TEXT,
      agriStackVerified INTEGER DEFAULT 0,
      creditScore INTEGER DEFAULT 0,
      fpo TEXT,
      isVerified INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Loans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loanId TEXT UNIQUE NOT NULL,
      farmerId INTEGER NOT NULL,
      loanType TEXT NOT NULL,
      amount REAL NOT NULL,
      purpose TEXT,
      cropType TEXT,
      season TEXT,
      tenure INTEGER,
      interestRate REAL DEFAULT 7.0,
      status TEXT DEFAULT 'PENDING',
      creditScore INTEGER,
      riskScore REAL,
      riskLevel TEXT,
      decision TEXT,
      decisionTime INTEGER,
      automated INTEGER DEFAULT 1,
      disbursedAmount REAL DEFAULT 0,
      disbursedAt DATETIME,
      insuranceEnabled INTEGER DEFAULT 0,
      insurancePolicyId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmerId) REFERENCES farmers(id)
    )
  `);

  // Risk Assessments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS risk_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmerId INTEGER NOT NULL,
      loanId INTEGER,
      overallRisk REAL,
      weatherRisk REAL,
      marketRisk REAL,
      satelliteRisk REAL,
      riskLevel TEXT,
      rainfall REAL,
      temperature REAL,
      droughtRisk REAL,
      floodRisk REAL,
      ndvi REAL,
      soilMoisture REAL,
      cropHealth TEXT,
      marketVolatility REAL,
      forwardPredictions TEXT,
      mitigationActions TEXT,
      insuranceTriggers TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmerId) REFERENCES farmers(id),
      FOREIGN KEY (loanId) REFERENCES loans(id)
    )
  `);

  // Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loanId INTEGER NOT NULL,
      amount REAL NOT NULL,
      paymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      paymentType TEXT,
      status TEXT DEFAULT 'SUCCESS',
      FOREIGN KEY (loanId) REFERENCES loans(id)
    )
  `);

  console.log('✅ Database tables created successfully');
};

// Seed test user
export const seedTestUser = () => {
  try {
    // Check if test user exists
    const existing = db.prepare('SELECT * FROM farmers WHERE email = ?').get('test@farmer.com');
    
    if (existing) {
      console.log('ℹ️  Test user already exists!');
      console.log('📧 Email: test@farmer.com');
      console.log('🔑 Password: Test@123');
      return;
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync('Test@123', 10);

    // Insert test farmer
    const stmt = db.prepare(`
      INSERT INTO farmers (
        farmerId, name, email, phone, password,
        village, district, state, pincode, latitude, longitude,
        totalArea, soilType, irrigationType, crops,
        aadhaar, pan, landRecords, bankAccount,
        agriStackId, agriStackVerified, creditScore, fpo, isVerified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      'FARMER001', 'Test Farmer', 'test@farmer.com', '9876543210', hashedPassword,
      'Test Village', 'Gandhinagar', 'Gujarat', '382010', 23.2156, 72.6369,
      5.5, 'Alluvial', 'Drip', JSON.stringify(['Wheat', 'Cotton', 'Rice']),
      '123456789012', 'ABCDE1234F', 'LAND001', '1234567890',
      'AGRISTACK001', 1, 720, 'Gujarat Farmers Cooperative', 1
    );

    console.log('✅ Test user created successfully!');
    console.log('\n📝 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    test@farmer.com');
    console.log('🔑 Password: Test@123');
    console.log('👤 Name:     Test Farmer');
    console.log('🆔 ID:       FARMER001');
    console.log('💳 Credit:   720 (Good)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error: any) {
    console.error('❌ Error creating test user:', error.message);
  }
};

export default db;
