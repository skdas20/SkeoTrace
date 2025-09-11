// Block model: application-level blockchain block stored in MongoDB
import mongoose, { Document, Schema } from 'mongoose';

export interface IBlock extends Document {
  _id: mongoose.Types.ObjectId;
  index: number; // sequential block index
  timestamp: Date; // block creation time
  prevHash: string; // previous block hash (or 'GENESIS')
  merkleRoot: string; // merkle root of included events
  hash: string; // SHA-256 hash of block header fields
  signer: string; // signer label (PoA by default)
  eventIds: mongoose.Types.ObjectId[]; // linked events in this block
  createdAt: Date;
  updatedAt: Date;
}

// Block schema (indexes help admin queries and verification)
const blockSchema = new Schema<IBlock>({
  index: {
    type: Number,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  prevHash: {
    type: String,
    required: true
  },
  merkleRoot: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true,
    unique: true
  },
  signer: {
    type: String,
    default: 'PoA'
  },
  eventIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, {
  timestamps: true
});

// Indexes to accelerate block lookups by index or hash
blockSchema.index({ index: 1 });
blockSchema.index({ hash: 1 });

export const Block = mongoose.model<IBlock>('Block', blockSchema);
