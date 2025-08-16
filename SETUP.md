# 🚀 TraceChain Setup Guide

Complete setup instructions for the Organic Food Traceability System.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB Atlas Account** (free) - [Create here](https://www.mongodb.com/atlas)

## 🔧 Quick Setup (5 minutes)

### Step 1: Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd Organic

# Install all dependencies (frontend + backend)
npm run install-all
```

### Step 2: Configure Environment
```bash
# Navigate to backend directory
cd backend

# Create .env file with your MongoDB connection
echo "PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://Sumit:okenopei123@cluster0.ebs6g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=organic_traceability
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5000000" > .env
```

### Step 3: Start Development Servers
```bash
# From root directory, start both frontend and backend
npm run dev

# This will open:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Step 4: Test the Application
1. Open browser to `http://localhost:3000`
2. Click "Sign up here" to create an account
3. Choose "Farmer" role and fill the form
4. Login and explore the dashboard!

## 🎯 Demo Accounts (Pre-configured)

Run `npm run seed` to create demo accounts for all 7 roles:

```
Farmer Demo:
Email: farmer@demo.com
Password: password123

Processor Demo:
Email: processor@demo.com
Password: password123

Distributor Demo:
Email: distributor@demo.com
Password: password123

Retailer Demo:
Email: retailer@demo.com
Password: password123

Certifier Demo:
Email: certifier@demo.com
Password: password123

Consumer Demo:
Email: consumer@demo.com
Password: password123

Admin Demo:
Email: admin@demo.com
Password: password123
```

**Note:** Use the seed command to automatically create these demo accounts.

## 📁 Project Structure

```
Organic/
├── frontend/                 # React.js application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── theme/          # Material-UI theme
│   │   └── App.js          # Main app component
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js API server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── uploads/            # File uploads (auto-created)
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── data/                   # Project documentation
├── package.json            # Root package.json
└── README.md               # Project documentation
```

## 🛠️ Development Scripts

From the root directory:

```bash
# Start both frontend and backend
npm run dev

# Start only backend (port 5000)
npm run server

# Start only frontend (port 3000)  
npm run client

# Build frontend for production
npm run build

# Install all dependencies
npm run install-all
```

## 🔍 API Testing

The backend API will be available at `http://localhost:5000/api`

### Test API Health:
```bash
curl http://localhost:5000/api/health
```

### Test User Registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Farmer",
    "email": "test@example.com", 
    "password": "password123",
    "role": "farmer",
    "organizationName": "Test Farm"
  }'
```

## 📱 Frontend Access

- **Development URL:** `http://localhost:3000`
- **Build Output:** `frontend/build/`
- **Hot Reload:** Enabled in development mode

### Key Features to Test:
1. **Authentication:** Login/Register forms
2. **Dashboard:** Role-based dashboard with stats
3. **QR Verification:** Visit `/verify/QR-BATCH12345678-abcd1234` (example)
4. **Navigation:** Sidebar navigation between pages

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)
Your MongoDB connection is already configured in the `.env` file. The application will automatically:

1. Connect to your MongoDB Atlas cluster
2. Create the `organic_traceability` database
3. Create collections as needed (users, batches, certificates)

### Local MongoDB (Optional)
If you prefer local MongoDB:

```bash
# Install MongoDB Community Edition
# Then update .env:
MONGODB_URI=mongodb://localhost:27017/organic_traceability
```

## 🧪 Testing Features

### Create Test Data:
1. **Register Users:** Create accounts for different roles
2. **Create Batches:** Login as farmer and create product batches  
3. **Generate QR:** Create QR codes for batches
4. **Verify QR:** Test the public verification page

### Test Blockchain:
The mock blockchain service automatically:
- Records batch creation events
- Generates transaction IDs
- Maintains immutable event history
- Provides verification endpoints

## ⚠️ Troubleshooting

### Common Issues:

**Port Already in Use:**
```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000  
npx kill-port 3000
```

**MongoDB Connection Error:**
- Check your MongoDB Atlas connection string
- Ensure your IP address is whitelisted in Atlas
- Verify username/password in connection string

**Module Not Found:**
```bash
# Reinstall dependencies
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install-all
```

**CORS Errors:**
- Ensure backend is running on port 5000
- Check `proxy` setting in `frontend/package.json`

### Environment Variables:
Make sure your `backend/.env` file has all required variables:
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

## 🚀 Production Deployment

### Build for Production:
```bash
npm run build
```

### Environment Setup:
Update `.env` for production:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<production-mongodb-uri>
JWT_SECRET=<strong-production-secret>
FRONTEND_URL=<your-domain>
```

### Deploy Options:
- **Heroku:** Easy deployment with Git
- **Vercel/Netlify:** Frontend deployment
- **AWS/Azure:** Full-stack deployment
- **DigitalOcean:** VPS deployment

## 📚 Next Steps

After setup:

1. **Explore the Codebase:** Understand the architecture
2. **Customize Features:** Add your specific requirements
3. **Test Thoroughly:** Try all user roles and workflows
4. **Add Real Blockchain:** Implement Hyperledger Fabric if needed
5. **Deploy:** Put it online for real users

## 💡 Development Tips

- **Hot Reload:** Frontend auto-refreshes on code changes
- **API Documentation:** Check `/backend/routes/` for all endpoints
- **Database:** Use MongoDB Compass to view data
- **Debugging:** Check browser console and terminal logs
- **Testing:** Use Postman/Insomnia for API testing

## 🆘 Need Help?

- **Documentation:** Check README.md for detailed information
- **Code Comments:** All major functions are commented
- **Console Logs:** Check browser/terminal for error messages
- **MongoDB:** Use Atlas dashboard to monitor database

---

**🎉 You're all set! Start building amazing blockchain-powered food traceability!** 🎉