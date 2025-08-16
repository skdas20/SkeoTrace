import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectDB } from '../src/db/mongoose';
import { env } from '../src/config/env';
import { User } from '../src/models/User';
import { Batch } from '../src/models/Batch';
import { Event } from '../src/models/Event';
import { Block } from '../src/models/Block';
import { BatchService } from '../src/services/batch';
import { BlockchainService } from '../src/services/blockchain';

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: 'PRODUCER' | 'RETAILER' | 'CONSUMER' | 'ADMIN';
}

const seedUsers: SeedUser[] = [
  {
    name: 'Admin User',
    email: 'admin@trace.local',
    password: 'Admin@123',
    role: 'ADMIN'
  },
  {
    name: 'Farm Producer',
    email: 'prod@trace.local',
    password: 'Prod@123',
    role: 'PRODUCER'
  },
  {
    name: 'Retail Shop',
    email: 'shop@trace.local',
    password: 'Retail@123',
    role: 'RETAILER'
  },
  {
    name: 'Consumer User',
    email: 'cons@trace.local',
    password: 'Cons@123',
    role: 'CONSUMER'
  }
];

const seed = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Batch.deleteMany({}),
      Event.deleteMany({}),
      Block.deleteMany({})
    ]);
    
    // Create users
    console.log('👥 Creating users...');
    const users: any[] = [];
    
    for (const userData of seedUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 12);
      const user = new User({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role
      });
      await user.save();
      users.push(user);
      
      console.log(`   ✅ Created ${userData.role}: ${userData.email}`);
    }
    
    // Find specific users for demo data
    const producer = users.find(u => u.role === 'PRODUCER');
    const retailer = users.find(u => u.role === 'RETAILER');
    
    if (!producer || !retailer) {
      throw new Error('Producer or Retailer not found');
    }
    
    // Create demo batch
    console.log('📦 Creating demo batch...');
    const demoBatch = await BatchService.createBatch({
      batchId: 'ORG-2025-001',
      productType: 'Organic Tomatoes',
      originFarm: 'Green Valley Farm, California',
      harvestDate: new Date('2025-08-10'),
      actorUserId: producer._id.toString()
    });
    
    console.log(`   ✅ Created batch: ${demoBatch.batchId}`);
    
    // Update batch with certification
    console.log('📋 Adding certification...');
    await BatchService.updateBatch(
      demoBatch.batchId,
      {
        certification: {
          status: 'APPROVED',
          docUrl: 'https://example.com/cert/ORG-2025-001.pdf',
          signedBy: 'USDA Organic Certification',
          signedAt: new Date()
        }
      },
      producer._id.toString()
    );
    
    // Transfer to retailer
    console.log('🚚 Transferring batch to retailer...');
    await BatchService.transferBatch(
      demoBatch.batchId,
      retailer._id.toString(),
      producer._id.toString(),
      'First shipment of summer harvest'
    );
    
    // Retailer receives batch
    console.log('📥 Retailer receiving batch...');
    await BatchService.updateBatchStatus(
      demoBatch.batchId,
      'RECEIVED',
      'RECEIVE',
      retailer._id.toString(),
      'Received in good condition, quality check passed'
    );
    
    // Generate tokens for easy testing
    console.log('🔑 Generating JWT tokens...');
    const tokens: any = {};
    
    for (const user of users) {
      const token = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      tokens[user.role.toLowerCase()] = {
        email: user.email,
        password: seedUsers.find(u => u.email === user.email)?.password,
        token
      };
    }
    
    // Verify blockchain
    console.log('🔗 Verifying blockchain integrity...');
    const verification = await BlockchainService.verifyChain();
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users created: ${users.length}`);
    console.log(`   Batches created: 1`);
    console.log(`   Events created: ${await Event.countDocuments()}`);
    console.log(`   Blocks created: ${await Block.countDocuments()}`);
    console.log(`   Blockchain integrity: ${verification.ok ? '✅ Valid' : '❌ Invalid'}`);
    
    console.log('\n🔐 Login Credentials:');
    for (const [role, creds] of Object.entries(tokens)) {
      console.log(`   ${role.toUpperCase()}:`);
      console.log(`     Email: ${(creds as any).email}`);
      console.log(`     Password: ${(creds as any).password}`);
      console.log(`     Token: ${(creds as any).token.substring(0, 50)}...`);
      console.log('');
    }
    
    console.log('🚀 You can now start the server with: npm run dev');
    console.log('📚 API Documentation: http://localhost:5000/docs');
    console.log(`🔍 Test batch traceability: http://localhost:5000/api/public/trace/${demoBatch.batchId}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run the seed
seed();
