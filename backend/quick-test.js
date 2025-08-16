const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function quickTest() {
  console.log('🧪 Quick Frontend Integration Test...\n');

  // Login as producer
  const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'prod@trace.local',
    password: 'Prod@123'
  });
  
  const token = loginResponse.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  console.log('✅ Producer login successful');

  // Test getting batches (what frontend calls)
  const batchesResponse = await axios.get(`${BASE_URL}/producer/batches`, { headers });
  console.log('✅ Get producer batches:', {
    status: batchesResponse.status,
    hasArray: Array.isArray(batchesResponse.data.batches),
    count: batchesResponse.data.batches?.length || 0
  });

  // Test creating a batch
  const newBatch = {
    batchId: `FRONTEND-TEST-${Date.now()}`,
    productType: 'Test Organic Carrots',
    originFarm: 'Frontend Test Farm',
    harvestDate: '2025-08-15'
  };

  const createResponse = await axios.post(`${BASE_URL}/producer/batches`, newBatch, { headers });
  console.log('✅ Create batch successful:', {
    status: createResponse.status,
    batchId: createResponse.data.batch?.batchId
  });

  // Test admin endpoints
  const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'admin@trace.local',
    password: 'Admin@123'
  });
  
  const adminHeaders = { Authorization: `Bearer ${adminLogin.data.token}` };
  
  const usersResponse = await axios.get(`${BASE_URL}/admin/users`, { headers: adminHeaders });
  console.log('✅ Get users (admin):', {
    status: usersResponse.status,
    hasArray: Array.isArray(usersResponse.data.users),
    count: usersResponse.data.users?.length || 0
  });

  console.log('\n🎉 All basic operations working!');
  console.log('Frontend should now work properly with:');
  console.log('- Login/Authentication ✅');
  console.log('- Producer dashboard ✅'); 
  console.log('- Admin dashboard ✅');
  console.log('- Batch creation ✅');
  console.log('- API response parsing ✅');
}

quickTest().catch(console.error);
