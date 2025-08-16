const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials from seed data
const users = {
  admin: { email: 'admin@trace.local', password: 'Admin@123' },
  producer: { email: 'prod@trace.local', password: 'Prod@123' },
  retailer: { email: 'shop@trace.local', password: 'Retail@123' },
  consumer: { email: 'cons@trace.local', password: 'Cons@123' }
};

let tokens = {};

async function login(role) {
  try {
    console.log(`\n🔐 Logging in as ${role}...`);
    const response = await axios.post(`${BASE_URL}/auth/login`, users[role]);
    tokens[role] = response.data.token;
    console.log(`✅ ${role} login successful`);
    return response.data;
  } catch (error) {
    console.error(`❌ ${role} login failed:`, error.response?.data || error.message);
    return null;
  }
}

async function testEndpoint(method, endpoint, role, data = null, description = '') {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: tokens[role] ? { Authorization: `Bearer ${tokens[role]}` } : {}
    };
    
    if (data && (method === 'POST' || method === 'PATCH')) {
      config.data = data;
    }

    console.log(`\n🧪 Testing ${method} ${endpoint} as ${role} - ${description}`);
    const response = await axios(config);
    console.log(`✅ Success: ${response.status} - ${JSON.stringify(response.data).substring(0, 100)}${Object.keys(response.data).length > 0 ? '...' : ''}`);
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message;
    console.error(`❌ Failed: ${status} - ${message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Backend API Tests...\n');

  // Test Health Check
  await testEndpoint('GET', '/health', null, null, 'Health check (no auth)');

  // Login all users
  for (const role of Object.keys(users)) {
    await login(role);
  }

  console.log('\n📋 Testing Authentication Endpoints...');
  
  // Test Auth Routes
  await testEndpoint('POST', '/auth/login', null, users.producer, 'Login endpoint');

  console.log('\n👥 Testing Admin Endpoints...');
  
  // Test Admin Routes
  await testEndpoint('GET', '/admin/users', 'admin', null, 'Get all users');
  await testEndpoint('GET', '/admin/blocks/verify', 'admin', null, 'Verify blockchain');
  await testEndpoint('GET', '/admin/blocks', 'admin', null, 'Get blocks');
  await testEndpoint('GET', '/admin/audit?batchId=ORG-2025-001', 'admin', null, 'Get audit trail');

  // Test unauthorized access
  await testEndpoint('GET', '/admin/users', 'producer', null, 'Admin endpoint as producer (should fail)');

  console.log('\n🌾 Testing Producer Endpoints...');
  
  // Test Producer Routes
  await testEndpoint('GET', '/producer/batches', 'producer', null, 'Get producer batches');
  
  const newBatch = {
    batchId: `TEST-${Date.now()}`,
    productType: 'Test Tomatoes',
    originFarm: 'Test Farm',
    harvestDate: '2025-08-15'
  };
  
  const createdBatch = await testEndpoint('POST', '/producer/batches', 'producer', newBatch, 'Create new batch');
  
  if (createdBatch?.batch?._id) {
    await testEndpoint('PATCH', `/producer/batches/${createdBatch.batch._id}`, 'producer', {
      certification: { status: 'APPROVED', signedBy: 'Test Certifier' }
    }, 'Update batch certification');
  }

  // Test unauthorized access
  await testEndpoint('GET', '/producer/batches', 'consumer', null, 'Producer endpoint as consumer (should fail)');

  console.log('\n🏪 Testing Retailer Endpoints...');
  
  // Test Retailer Routes
  await testEndpoint('GET', '/retailer/batches', 'retailer', null, 'Get retailer batches');
  await testEndpoint('GET', '/retailer/batches/search?batchId=ORG-2025-001', 'retailer', null, 'Search batch by ID');
  
  // Test batch operations if we have a batch
  if (createdBatch?.batch?._id) {
    await testEndpoint('POST', `/retailer/batches/${createdBatch.batch._id}/receive`, 'retailer', { note: 'Test receive' }, 'Receive batch');
    await testEndpoint('POST', `/retailer/batches/${createdBatch.batch._id}/store`, 'retailer', { note: 'Test store' }, 'Store batch');
    await testEndpoint('POST', `/retailer/batches/${createdBatch.batch._id}/sell`, 'retailer', { note: 'Test sell' }, 'Sell batch');
  }

  // Test unauthorized access
  await testEndpoint('GET', '/retailer/batches', 'admin', null, 'Retailer endpoint as admin (should fail)');

  console.log('\n🌍 Testing Public Endpoints...');
  
  // Test Public Routes (no auth required)
  await testEndpoint('GET', '/public/trace/ORG-2025-001', null, null, 'Public trace batch');
  
  console.log('\n📊 Test Summary:');
  console.log('================');
  console.log('✅ Check the results above for any ❌ failures');
  console.log('✅ All endpoints should return proper responses or expected errors');
  console.log('✅ Auth should work for correct roles and fail for wrong roles');
  console.log('\n🔍 Frontend Implementation Check:');
  console.log('- Verify API client methods match backend responses');
  console.log('- Check that arrays are properly extracted from response objects');
  console.log('- Ensure error handling works properly');
}

// Run tests
runTests().catch(console.error);
