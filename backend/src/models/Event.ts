import mongoose, { Document, Schema } from 'mongoose';

export type EventType = 'BATCH_CREATED' | 'HARVEST_UPDATED' | 'CERT_UPLOAD' | 'TRANSFER' | 'RECEIVE' | 'STORE' | 'SELL';

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  batchId: string;
  type: EventType;
  payload: Record<string, any>;
  actorUserId: mongoose.Types.ObjectId;
  timestamp: Date;
  blockId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>({
  batchId: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['BATCH_CREATED', 'HARVEST_UPDATED', 'CERT_UPLOAD', 'TRANSFER', 'RECEIVE', 'STORE', 'SELL'],
    required: true
  },
  payload: {
    type: Schema.Types.Mixed,
    required: true
  },
  actorUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  blockId: {
    type: Schema.Types.ObjectId,
    ref: 'Block'
  }
}, {
  timestamps: true
});

eventSchema.index({ batchId: 1, timestamp: 1 });
eventSchema.index({ actorUserId: 1 });
eventSchema.index({ blockId: 1 });

export const Event = mongoose.model<IEvent>('Event', eventSchema);
