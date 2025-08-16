import { Block, IBlock } from '../models/Block';
import { Event, IEvent } from '../models/Event';
import { sha256 } from '../utils/hash';
import { calculateMerkleRoot } from '../utils/merkle';

export interface ChainVerificationResult {
  ok: boolean;
  issues: string[];
}

export class BlockchainService {
  static async createBlock(eventIds: string[]): Promise<IBlock> {
    const lastBlock = await Block.findOne().sort({ index: -1 });
    const index = lastBlock ? lastBlock.index + 1 : 0;
    const prevHash = lastBlock ? lastBlock.hash : 'GENESIS';
    
    // Get events for merkle root calculation
    const events = await Event.find({ _id: { $in: eventIds } });
    const eventData = events.map(e => JSON.stringify({
      type: e.type,
      batchId: e.batchId,
      timestamp: e.timestamp
    }));
    
    const merkleRoot = calculateMerkleRoot(eventData);
    const timestamp = new Date();
    const hash = sha256(`${index}${timestamp.toISOString()}${prevHash}${merkleRoot}`);

    const block = new Block({
      index,
      timestamp,
      prevHash,
      merkleRoot,
      hash,
      signer: 'PoA',
      eventIds
    });

    await block.save();

    // Update events with blockId
    await Event.updateMany(
      { _id: { $in: eventIds } },
      { $set: { blockId: block._id } }
    );

    return block;
  }

  static async verifyChain(): Promise<ChainVerificationResult> {
    const issues: string[] = [];
    const blocks = await Block.find().sort({ index: 1 });

    if (blocks.length === 0) {
      return { ok: true, issues: [] };
    }

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      
      // Check index sequence
      if (block.index !== i) {
        issues.push(`Block ${i}: Invalid index. Expected ${i}, got ${block.index}`);
      }

      // Check previous hash
      if (i === 0) {
        if (block.prevHash !== 'GENESIS') {
          issues.push(`Block ${i}: First block should have prevHash 'GENESIS'`);
        }
      } else {
        const prevBlock = blocks[i - 1];
        if (block.prevHash !== prevBlock.hash) {
          issues.push(`Block ${i}: Invalid prevHash. Expected ${prevBlock.hash}, got ${block.prevHash}`);
        }
      }

      // Verify hash
      const expectedHash = sha256(`${block.index}${block.timestamp.toISOString()}${block.prevHash}${block.merkleRoot}`);
      if (block.hash !== expectedHash) {
        issues.push(`Block ${i}: Invalid hash. Expected ${expectedHash}, got ${block.hash}`);
      }

      // Verify merkle root
      const events = await Event.find({ _id: { $in: block.eventIds } });
      const eventData = events.map(e => JSON.stringify({
        type: e.type,
        batchId: e.batchId,
        timestamp: e.timestamp
      }));
      const expectedMerkleRoot = calculateMerkleRoot(eventData);
      if (block.merkleRoot !== expectedMerkleRoot) {
        issues.push(`Block ${i}: Invalid merkle root. Expected ${expectedMerkleRoot}, got ${block.merkleRoot}`);
      }
    }

    return {
      ok: issues.length === 0,
      issues
    };
  }

  static async getBatchHistory(batchId: string): Promise<{
    events: IEvent[];
    timeline: Array<{
      type: string;
      at: Date;
      by: string;
      payload: any;
    }>;
  }> {
    const events = await Event.find({ batchId })
      .populate('actorUserId', 'name email role')
      .sort({ timestamp: 1 });

    const timeline = events.map(event => ({
      type: event.type,
      at: event.timestamp,
      by: (event.actorUserId as any)?.name || 'Unknown',
      payload: event.payload
    }));

    return { events, timeline };
  }
}
