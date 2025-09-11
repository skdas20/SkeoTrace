// Batch model: represents a product batch tracked across the system
import mongoose, { Document, Schema } from 'mongoose';

// Domain status values for a batch
export type BatchStatus = 'CREATED' | 'PROCESSING' | 'CERTIFIED' | 'IN_TRANSIT' | 'RECEIVED' | 'STORED' | 'SOLD';

// Certification states
export type CertificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Certification subdocument shape
export interface ICertification {
  status: CertificationStatus;
  docUrl?: string;
  signedBy?: string;
  signedAt?: Date;
}

export interface IBatch extends Document {
  _id: mongoose.Types.ObjectId;
  batchId: string; // public-friendly batch identifier
  productType: string;
  originFarm: string;
  harvestDate?: Date;
  status: BatchStatus;
  currentOwnerUserId?: mongoose.Types.ObjectId; // owner user reference
  certification?: ICertification; // optional certification metadata
  eventIds: mongoose.Types.ObjectId[]; // linked events for timeline
  createdAt: Date;
  updatedAt: Date;
}

// Certification sub-schema (embedded, no _id)
const certificationSchema = new Schema<ICertification>({
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  docUrl: String,
  signedBy: String,
  signedAt: Date
}, { _id: false });

// Main batch schema persisted to MongoDB
const batchSchema = new Schema<IBatch>({
  batchId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  productType: {
    type: String,
    required: true,
    trim: true
  },
  originFarm: {
    type: String,
    required: true,
    trim: true
  },
  harvestDate: Date,
  status: {
    type: String,
    enum: ['CREATED', 'PROCESSING', 'CERTIFIED', 'IN_TRANSIT', 'RECEIVED', 'STORED', 'SOLD'],
    default: 'CREATED'
  },
  currentOwnerUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  certification: certificationSchema,
  eventIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, {
  timestamps: true
});

// Indexes for quick lookup by batchId and owner
batchSchema.index({ batchId: 1 });
batchSchema.index({ currentOwnerUserId: 1 });

export const Batch = mongoose.model<IBatch>('Batch', batchSchema);
