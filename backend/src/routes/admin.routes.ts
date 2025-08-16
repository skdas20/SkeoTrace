import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import { User } from '../models/User';
import { Block } from '../models/Block';
import { Event } from '../models/Event';
import { BlockchainService } from '../services/blockchain';

const router = express.Router();

// Get all users
router.get('/users', requireAuth, requireRole('ADMIN'), async (req: any, res: any, next: any) => {
  try {
    const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// Verify blockchain
router.get('/blocks/verify', requireAuth, requireRole('ADMIN'), async (req: any, res: any, next: any) => {
  try {
    const verification = await BlockchainService.verifyChain();
    res.json(verification);
  } catch (error) {
    next(error);
  }
});

// Get audit trail for batch
router.get('/audit', requireAuth, requireRole('ADMIN'), async (req: any, res: any, next: any) => {
  try {
    const { batchId } = req.query;
    
    if (!batchId) {
      return res.status(400).json({ error: 'batchId query parameter is required' });
    }

    const events = await Event.find({ batchId })
      .populate('actorUserId', 'name email role')
      .populate('blockId', 'index hash timestamp')
      .sort({ timestamp: 1 });

    res.json({ batchId, events });
  } catch (error) {
    next(error);
  }
});

// Get blocks with pagination
router.get('/blocks', requireAuth, requireRole('ADMIN'), async (req: any, res: any, next: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [blocks, totalCount] = await Promise.all([
      Block.find()
        .populate('eventIds', 'type batchId timestamp')
        .sort({ index: -1 })
        .skip(skip)
        .limit(limit),
      Block.countDocuments()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      blocks,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
