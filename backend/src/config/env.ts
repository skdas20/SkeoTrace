import dotenv from 'dotenv';

dotenv.config();

export const env = {
  MONGO_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/organic_traceability',
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_PUBLIC_URL: process.env.FRONTEND_PUBLIC_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

if (!process.env.JWT_SECRET && env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be provided in production');
}

if (!process.env.MONGODB_URI && !process.env.MONGO_URI && env.NODE_ENV === 'production') {
  throw new Error('MONGODB_URI or MONGO_URI must be provided in production');
}
