// User model: stores user credentials and role for RBAC
import mongoose, { Document, Schema } from 'mongoose';

// Role enum used throughout middleware and routes
export type Role = 'PRODUCER' | 'RETAILER' | 'CONSUMER' | 'ADMIN';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema for user credentials and role
const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['PRODUCER', 'RETAILER', 'CONSUMER', 'ADMIN'],
    required: true
  }
}, {
  timestamps: true
});

// Index on email for quick lookup and uniqueness
userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
