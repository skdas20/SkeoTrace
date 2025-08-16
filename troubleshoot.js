#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 TraceChain Troubleshooting Script\n');

// Check if we're in the right directory
const currentDir = process.cwd();
console.log(`📂 Current directory: ${currentDir}`);

// Check if main files exist
const files = [
  'package.json',
  'frontend/package.json', 
  'backend/package.json',
  'frontend/src/index.js',
  'frontend/src/App.js',
  'backend/server.js'
];

console.log('\n📋 Checking essential files:');
files.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check node_modules
const nodeModulesChecks = [
  'node_modules',
  'frontend/node_modules',
  'backend/node_modules'
];

console.log('\n📦 Checking node_modules:');
nodeModulesChecks.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`${exists ? '✅' : '❌'} ${dir}`);
  if (!exists) {
    console.log(`   Run: npm install in ${dir.includes('/') ? path.dirname(dir) : 'root'}`);
  }
});

// Check package.json scripts
console.log('\n🚀 Available scripts:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  Object.keys(pkg.scripts || {}).forEach(script => {
    console.log(`✅ npm run ${script}`);
  });
} catch (e) {
  console.log('❌ Could not read package.json scripts');
}

// Check ports
console.log('\n🔗 Default ports:');
console.log('✅ Frontend: http://localhost:3000');
console.log('✅ Backend: http://localhost:5000');

console.log('\n🛠️ Quick fixes:');
console.log('1. npm run install-all (install all dependencies)');
console.log('2. npm run dev (start both frontend and backend)');
console.log('3. Check browser console for detailed errors');
console.log('4. Check terminal output for build errors');

console.log('\n📞 If you see errors, try:');
console.log('• rm -rf node_modules frontend/node_modules backend/node_modules');
console.log('• npm run install-all');
console.log('• npm run dev');

console.log('\n🔥 Emergency simple mode:');
console.log('• Replace App.js with App.simple.js for basic version');
console.log('• cp frontend/src/App.simple.js frontend/src/App.js');