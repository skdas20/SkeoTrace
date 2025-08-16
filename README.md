# TraceChain - Organic Food Traceability System

A comprehensive blockchain-based organic food traceability system that ensures transparency, authenticity, and trust throughout the entire supply chain from farm to consumer.

## 🌱 Overview

TraceChain leverages blockchain technology to create an immutable record of organic food products' journey through the supply chain, enabling consumers to verify the authenticity and origin of their food with a simple QR code scan.

## ✨ Features

### Core Functionality
- **🔗 Blockchain Integration**: Immutable supply chain event logging
- **📱 QR Code System**: Easy product verification for consumers
- **📋 Certificate Management**: Digital organic certification handling
- **👥 Multi-Role Support**: Farmers, Processors, Certifiers, Distributors, Retailers, Consumers, Admins
- **📊 Real-time Tracking**: Live batch status updates across the supply chain

### Key Benefits
- **🛡️ Trust & Transparency**: Immutable blockchain records
- **⚡ Real-time Verification**: Instant QR code scanning
- **📜 Automated Compliance**: Streamlined regulatory documentation
- **🎯 Supply Chain Efficiency**: Reduced paperwork and errors
- **💰 Premium Pricing**: Verified organic authentication

## 🏗️ Architecture

```
Frontend (React.js) → Backend (Node.js/Express) → Database (MongoDB)
                                ↓
                         Blockchain Service
                    (Hyperledger Fabric/Mock)
```

## 🚀 Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **Material-UI** - Professional component library
- **React Router** - Navigation and routing
- **Axios** - API communication
- **QR Code Libraries** - QR generation and scanning

### Backend  
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **QRCode** - QR generation

### Blockchain
- **Mock Blockchain Service** (Development)
- **Hyperledger Fabric** (Production-ready)
- **Cryptographic Hashing** - Data integrity

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Atlas or local)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd Organic
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm run install-all

# Or install separately:
npm run install-server  # Backend dependencies
npm run install-client  # Frontend dependencies
```

### 3. Environment Configuration

Create `.env` file in `/backend`:
```env
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://Sumit:okenopei123@cluster0.ebs6g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=organic_traceability

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run server  # Backend only (localhost:5000)
npm run client  # Frontend only (localhost:3000)
```

## 👤 User Roles & Access

| Role | Capabilities |
|------|-------------|
| **Farmer** | Create batches, request certification, track farm products |
| **Processor** | Update batch processing, split/merge batches, handle manufacturing |
| **Certifier** | Upload certificates, approve/reject organic claims, validate compliance |
| **Distributor** | Track shipments, update logistics, manage warehousing |
| **Retailer** | Receive products, update inventory, record sales |
| **Consumer** | Scan QR codes, verify product authenticity, view full traceability |
| **Admin** | System management, user oversight, analytics and reporting |

## 🔧 Demo Credentials

For testing purposes, use `npm run seed` to create demo users for all roles:

```
Farmer Account:
Email: farmer@demo.com
Password: password123

Processor Account:
Email: processor@demo.com
Password: password123

Distributor Account:
Email: distributor@demo.com
Password: password123

Retailer Account:
Email: retailer@demo.com
Password: password123

Certifier Account:
Email: certifier@demo.com
Password: password123

Consumer Account:
Email: consumer@demo.com
Password: password123

Admin Account:
Email: admin@demo.com  
Password: password123
```

## 📱 Usage Guide

### For Farmers
1. **Register** as a farmer with organization details
2. **Create Batches** for harvested organic products
3. **Request Certification** from certified authorities
4. **Generate QR Codes** for product labeling
5. **Transfer Batches** to processors/distributors

### For Consumers
1. **Scan QR Code** on organic product packaging
2. **View Product Journey** from farm to retail
3. **Verify Certificates** and organic compliance
4. **Check Freshness** and quality metrics
5. **Trust the Source** with blockchain verification

### For Supply Chain Partners
1. **Register** with appropriate role
2. **Receive/Update Batches** as they move through supply chain
3. **Upload Documentation** and compliance certificates
4. **Track Real-time Status** of all products
5. **Maintain Traceability** records

## 🔐 Security Features

- **JWT Authentication** - Secure user sessions
- **Role-based Access Control** - Permission management
- **Data Encryption** - Secure data transmission
- **Blockchain Immutability** - Tamper-proof records
- **File Hash Verification** - Document integrity
- **Input Validation** - XSS and injection protection

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Batch Management
- `GET /api/batch` - List batches
- `POST /api/batch` - Create new batch
- `GET /api/batch/:id` - Get batch details
- `PUT /api/batch/:id` - Update batch
- `GET /api/batch/qr/:qrCode` - Get batch by QR code

### QR Code System
- `POST /api/qr/generate/:batchId` - Generate QR code
- `GET /api/qr/verify/:qrCode` - Verify QR code (Public)

### Certificates
- `POST /api/certificate` - Upload certificate
- `GET /api/certificate` - List certificates
- `PUT /api/certificate/:id/approve` - Approve certificate

### Blockchain
- `POST /api/blockchain/record-batch` - Record batch on blockchain
- `GET /api/blockchain/batch-history/:batchId` - Get blockchain history

## 🎯 UN Sustainable Development Goals

This project supports:

- **SDG 2: Zero Hunger** - Ensuring food safety and reducing fraud
- **SDG 9: Industry, Innovation, and Infrastructure** - Blockchain technology integration
- **SDG 12: Responsible Consumption and Production** - Transparent and ethical food choices

## 🚀 Production Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<strong-secret-key>
FRONTEND_URL=<your-frontend-domain>
```

### Build for Production
```bash
# Build frontend
npm run build

# Deploy to your preferred hosting service:
# - Heroku
# - AWS
# - Azure
# - DigitalOcean
```

## 🔄 Blockchain Integration Options

### Current Implementation
- **Mock Blockchain Service** - Perfect for development and demonstration
- **Simulated Transactions** - All blockchain features without complexity
- **Hash Generation** - Cryptographic verification
- **Immutable Records** - Tamper-proof event logging

### Production Options
1. **Hyperledger Fabric** - Enterprise blockchain platform
2. **Ethereum Private Network** - Smart contracts
3. **AWS Managed Blockchain** - Cloud-based solution
4. **IBM Blockchain Platform** - Enterprise-grade service

## 📈 Future Enhancements

- [ ] **Mobile App** (React Native)
- [ ] **IoT Integration** (Temperature/Humidity sensors)
- [ ] **AI-powered Analytics** (Predictive quality assessment)
- [ ] **Multi-language Support** (Internationalization)
- [ ] **Advanced Reporting** (Business intelligence)
- [ ] **Smart Contracts** (Automated compliance)
- [ ] **API Gateway** (Rate limiting, monitoring)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Development Team

**DEVNEST Team**
- Department: CSE (IoT CS BT)
- Institution: [Your Institution Name]
- Project Guides: Prof. Subhabrata Sen Gupta, Dr. Rupayan Das

## 📞 Support

For support and queries:
- 📧 Email: [your-email@domain.com]
- 🐛 Issues: [GitHub Issues](link-to-issues)
- 📖 Documentation: [Project Wiki](link-to-wiki)

---

**🌱 "Ensuring transparency from farm to table with blockchain technology"** 🌱