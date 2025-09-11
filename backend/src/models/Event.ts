// Event model: records discrete domain events for batches (used as Merkle leaves)
import mongoose, { Document, Schema } from 'mongoose';

// Allowed event types in the domain
export type EventType = 'BATCH_CREATED' | 'HARVEST_UPDATED' | 'CERT_UPLOAD' | 'TRANSFER' | 'RECEIVE' | 'STORE' | 'SELL';

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  batchId: string; // friendly batch identifier
  type: EventType; // domain event type
  payload: Record<string, any>; // arbitrary event payload
  actorUserId: mongoose.Types.ObjectId; // user who performed the action
  timestamp: Date; // event timestamp
  blockId?: mongoose.Types.ObjectId; // link to block once included
  createdAt: Date;
  updatedAt: Date;
}

// Event schema persisted to MongoDB. Events are the atomic records used to compute Merkle roots.
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

// Indexes to support efficient queries by batch, actor and block linkage
eventSchema.index({ batchId: 1, timestamp: 1 });
eventSchema.index({ actorUserId: 1 });
eventSchema.index({ blockId: 1 });

export const Event = mongoose.model<IEvent>('Event', eventSchema);
