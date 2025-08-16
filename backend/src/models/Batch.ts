import mongoose, { Document, Schema } from 'mongoose';

export type BatchStatus = 'CREATED' | 'PROCESSING' | 'CERTIFIED' | 'IN_TRANSIT' | 'RECEIVED' | 'STORED' | 'SOLD';

export type CertificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ICertification {
  status: CertificationStatus;
  docUrl?: string;
  signedBy?: string;
  signedAt?: Date;
}

export interface IBatch extends Document {
  _id: mongoose.Types.ObjectId;
  batchId: string;
  productType: string;
  originFarm: string;
  harvestDate?: Date;
  status: BatchStatus;
  currentOwnerUserId?: mongoose.Types.ObjectId;
  certification?: ICertification;
  eventIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

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

batchSchema.index({ batchId: 1 });
batchSchema.index({ currentOwnerUserId: 1 });

export const Batch = mongoose.model<IBatch>('Batch', batchSchema);
