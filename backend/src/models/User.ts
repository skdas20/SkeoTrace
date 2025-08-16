import mongoose, { Document, Schema } from 'mongoose';

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

userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
