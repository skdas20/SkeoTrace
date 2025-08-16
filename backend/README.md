# Organic Food Traceability API

A minimal, production-lean Node.js TypeScript REST API for organic food traceability with blockchain-like immutable event logging.

## Features

- **Role-based Authentication**: JWT-based auth with 4 roles (PRODUCER, RETAILER, CONSUMER, ADMIN)
- **Blockchain Mimic**: Immutable event logging with block chaining, merkle roots, and integrity verification
- **QR Code Generation**: Generate QR codes for batch traceability
- **Public Traceability**: Public endpoint for consumers to trace food products
- **API Documentation**: Swagger/OpenAPI documentation
- **Data Validation**: Zod-based request validation
- **Security**: Helmet, CORS, and other security middleware

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Documentation**: Swagger UI + OpenAPI
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **QR Codes**: qrcode library

## Quick Start

### Prerequisites

- Node.js 20 or higher
- MongoDB running locally or connection string
- npm or yarn package manager

### Installation

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/organic_traceability
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   PORT=5000
   FRONTEND_PUBLIC_URL=http://localhost:3000
   ```

4. **Build the TypeScript code**:
   ```bash
   npm run build
   ```

5. **Seed the database with demo data**:
   ```bash
   npm run seed
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: http://localhost:5000/docs

## Demo Data

The seed script creates:

### Users
- **Admin**: admin@trace.local / Admin@123
- **Producer**: prod@trace.local / Prod@123  
- **Retailer**: shop@trace.local / Retail@123
- **Consumer**: cons@trace.local / Cons@123

### Demo Batch
- **Batch ID**: ORG-2025-001
- **Product**: Organic Tomatoes
- **Origin**: Green Valley Farm, California
- **Status Flow**: Created → Certified → Transferred → Received

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Producer (Requires PRODUCER role)
- `POST /api/producer/batches` - Create new batch
- `PATCH /api/producer/batches/:id` - Update batch (harvest date, certification)
- `POST /api/producer/batches/:id/transfer` - Transfer batch to retailer
- `GET /api/producer/batches` - Get producer's batches

### Retailer (Requires RETAILER role)
- `POST /api/retailer/batches/:id/receive` - Receive transferred batch
- `POST /api/retailer/batches/:id/store` - Store received batch
- `POST /api/retailer/batches/:id/sell` - Sell stored batch
- `GET /api/retailer/batches` - Get retailer's batches

### Admin (Requires ADMIN role)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/blocks/verify` - Verify blockchain integrity
- `GET /api/admin/audit?batchId=xxx` - Get audit trail for batch
- `GET /api/admin/blocks` - Get blocks with pagination

### Public (No authentication required)
- `GET /api/public/trace/:batchId` - Get full traceability for batch
- `GET /api/public/qrcode/:batchId` - Generate QR code for batch
- `GET /api/health` - Health check

## Data Models

### User
```typescript
{
  name: string;
  email: string; // unique
  passwordHash: string;
  role: 'PRODUCER' | 'RETAILER' | 'CONSUMER' | 'ADMIN';
}
```

### Batch
```typescript
{
  batchId: string; // unique
  productType: string;
  originFarm: string;
  harvestDate?: Date;
  status: 'CREATED' | 'PROCESSING' | 'CERTIFIED' | 'IN_TRANSIT' | 'RECEIVED' | 'STORED' | 'SOLD';
  currentOwnerUserId?: ObjectId;
  certification?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    docUrl?: string;
    signedBy?: string;
    signedAt?: Date;
  };
  eventIds: ObjectId[]; // ordered events
}
```

### Event
```typescript
{
  batchId: string;
  type: 'BATCH_CREATED' | 'HARVEST_UPDATED' | 'CERT_UPLOAD' | 'TRANSFER' | 'RECEIVE' | 'STORE' | 'SELL';
  payload: object;
  actorUserId: ObjectId;
  timestamp: Date;
  blockId?: ObjectId;
}
```

### Block (Blockchain Mimic)
```typescript
{
  index: number;
  timestamp: Date;
  prevHash: string;
  merkleRoot: string;
  hash: string;
  signer: 'PoA';
  eventIds: ObjectId[];
}
```

## Blockchain Features

- **Immutable Events**: All business actions create events that are chained into blocks
- **Hash Chaining**: Each block references the previous block's hash
- **Merkle Trees**: Events in each block are hashed into a merkle root
- **Integrity Verification**: `/admin/blocks/verify` endpoint checks chain integrity
- **Proof of Authority**: Simple PoA consensus for demo purposes

## Business Rules

- Only current owner can modify batch status
- Batches can only be sold after being received or stored
- Certification can be added by producers
- Transfer changes ownership and status to IN_TRANSIT
- Each action creates an immutable event and block

## Development

### Available Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run seed` - Seed database with demo data
- `npm test` - Run tests (if configured)

### Project Structure

```
backend/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server startup
│   ├── config/
│   │   └── env.ts          # Environment configuration
│   ├── db/
│   │   └── mongoose.ts     # Database connection
│   ├── middleware/
│   │   ├── auth.ts         # JWT authentication
│   │   ├── rbac.ts         # Role-based access control
│   │   └── error.ts        # Error handling
│   ├── utils/
│   │   ├── hash.ts         # SHA256 hashing utilities
│   │   ├── merkle.ts       # Merkle tree calculation
│   │   └── qr.ts           # QR code generation
│   ├── models/
│   │   ├── User.ts         # User model
│   │   ├── Batch.ts        # Batch model
│   │   ├── Event.ts        # Event model
│   │   └── Block.ts        # Block model
│   ├── services/
│   │   ├── blockchain.ts   # Blockchain service
│   │   └── batch.ts        # Batch service
│   ├── routes/
│   │   ├── auth.routes.ts  # Authentication routes
│   │   ├── producer.routes.ts # Producer routes
│   │   ├── retailer.routes.ts # Retailer routes
│   │   ├── admin.routes.ts    # Admin routes
│   │   ├── public.routes.ts   # Public routes
│   │   └── index.ts           # Route aggregation
│   └── docs/
│       └── openapi.yaml    # OpenAPI specification
├── scripts/
│   └── seed.ts             # Database seeding script
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Testing

### Manual Testing

1. Start the server: `npm run dev`
2. Open Swagger UI: http://localhost:5000/docs
3. Use the demo credentials to login and get JWT tokens
4. Test the various endpoints using the Swagger interface

### Example API Calls

```bash
# Login as producer
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"prod@trace.local","password":"Prod@123"}'

# Create a batch (use token from login)
curl -X POST http://localhost:5000/api/producer/batches \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"batchId":"TEST-001","productType":"Organic Apples","originFarm":"Test Farm"}'

# Get public traceability
curl http://localhost:5000/api/public/trace/ORG-2025-001
```

## Security Considerations

- JWT tokens expire in 24 hours
- Passwords are hashed with bcrypt (12 rounds)
- CORS enabled for frontend integration
- Helmet middleware for security headers
- Input validation with Zod
- Role-based access control

## Production Deployment

1. Set strong `JWT_SECRET` in production
2. Use a secure MongoDB connection string
3. Enable MongoDB authentication
4. Set `NODE_ENV=production`
5. Use process manager like PM2
6. Enable HTTPS/TLS
7. Configure proper logging
8. Set up monitoring

## License

MIT License - See LICENSE file for details.
