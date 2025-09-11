// Blockchain service - application-level blockchain implemented on top of MongoDB
// Provides utilities to create blocks (with merkle roots) and to verify the chain
import { Block, IBlock } from '../models/Block';
import { Event, IEvent } from '../models/Event';
import { sha256 } from '../utils/hash';
import { calculateMerkleRoot } from '../utils/merkle';

// Result shape returned by verifyChain
export interface ChainVerificationResult {
  ok: boolean; // true if no issues found
  issues: string[]; // list of human-friendly problems
}

export class BlockchainService {
  // Create a new block containing the provided event IDs
  static async createBlock(eventIds: string[]): Promise<IBlock> {
    // Fetch the latest block to determine index and previous hash
    const lastBlock = await Block.findOne().sort({ index: -1 });
    const index = lastBlock ? lastBlock.index + 1 : 0; // next sequential index
    const prevHash = lastBlock ? lastBlock.hash : 'GENESIS'; // genesis marker for first block

    // Load event documents for merkle calculation
    const events = await Event.find({ _id: { $in: eventIds } });
    const eventData = events.map(e => JSON.stringify({
      type: e.type,
      batchId: e.batchId,
      timestamp: e.timestamp
    }));

    // Compute merkle root from serialized event payloads
    const merkleRoot = calculateMerkleRoot(eventData);
    const timestamp = new Date();

    // Compute block hash deterministically from index, timestamp, prevHash and merkleRoot
    const hash = sha256(`${index}${timestamp.toISOString()}${prevHash}${merkleRoot}`);

    // Construct and persist block document
    const block = new Block({
      index,
      timestamp,
      prevHash,
      merkleRoot,
      hash,
      signer: 'PoA', // application uses Proof-of-Authority-style signer label
      eventIds
    });

    await block.save();

    // Link each event to the block by setting event.blockId
    await Event.updateMany(
      { _id: { $in: eventIds } },
      { $set: { blockId: block._id } }
    );

    // Return saved block
    return block;
  }

  // Verify chain integrity by walking blocks in order and checking hashes/merkle roots
  static async verifyChain(): Promise<ChainVerificationResult> {
    const issues: string[] = [];
    const blocks = await Block.find().sort({ index: 1 });

    // Empty chain is trivially valid
    if (blocks.length === 0) {
      return { ok: true, issues: [] };
    }

    // Iterate and validate each block
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];

      // Validate index sequence
      if (block.index !== i) {
        issues.push(`Block ${i}: Invalid index. Expected ${i}, got ${block.index}`);
      }

      // Validate prevHash chain linkage
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

      // Recompute expected hash and compare
      const expectedHash = sha256(`${block.index}${block.timestamp.toISOString()}${block.prevHash}${block.merkleRoot}`);
      if (block.hash !== expectedHash) {
        issues.push(`Block ${i}: Invalid hash. Expected ${expectedHash}, got ${block.hash}`);
      }

      // Recompute merkle root from stored events and compare
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

    // Return verification result
    return {
      ok: issues.length === 0,
      issues
    };
  }

  // Get history (events + timeline) for a batch
  static async getBatchHistory(batchId: string): Promise<{
    events: IEvent[];
    timeline: Array<{
      type: string;
      at: Date;
      by: string;
      payload: any;
    }>;
  }> {
    // Load events for that batch and populate actor info
    const events = await Event.find({ batchId })
      .populate('actorUserId', 'name email role')
      .sort({ timestamp: 1 });

    // Build a presentation-ready timeline array
    const timeline = events.map(event => ({
      type: event.type,
      at: event.timestamp,
      by: (event.actorUserId as any)?.name || 'Unknown',
      payload: event.payload
    }));

    return { events, timeline };
  }
}
