// MongoDB connection helper using Mongoose
import mongoose from 'mongoose';
import { env } from '../config/env';

export const connectDB = async (): Promise<void> => {
  try {
    // Attempt to connect using configured URI
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log and exit — the app depends on DB
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
