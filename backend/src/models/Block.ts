import mongoose, { Document, Schema } from 'mongoose';

export interface IBlock extends Document {
  _id: mongoose.Types.ObjectId;
  index: number;
  timestamp: Date;
  prevHash: string;
  merkleRoot: string;
  hash: string;
  signer: string;
  eventIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

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

blockSchema.index({ index: 1 });
blockSchema.index({ hash: 1 });

export const Block = mongoose.model<IBlock>('Block', blockSchema);
