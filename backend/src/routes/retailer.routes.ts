import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import { BatchService } from '../services/batch';
import { Batch } from '../models/Batch';

const router = express.Router();

const noteSchema = z.object({
  note: z.string().optional()
});

// Receive batch
router.post('/batches/:id/receive', requireAuth, requireRole('RETAILER'), async (req: any, res: any, next: any) => {
  try {
    const data = noteSchema.parse(req.body);
    const batchId = req.params.id;
    
    const batch = await BatchService.updateBatchStatus(
      batchId,
      'RECEIVED',
      'RECEIVE',
      req.user._id.toString(),
      data.note
    );

    res.json({
      message: 'Batch received successfully',
      batch
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// Store batch
router.post('/batches/:id/store', requireAuth, requireRole('RETAILER'), async (req: any, res: any, next: any) => {
  try {
    const data = noteSchema.parse(req.body);
    const batchId = req.params.id;
    
    const batch = await BatchService.updateBatchStatus(
      batchId,
      'STORED',
      'STORE',
      req.user._id.toString(),
      data.note
    );

    res.json({
      message: 'Batch stored successfully',
      batch
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// Sell batch
router.post('/batches/:id/sell', requireAuth, requireRole('RETAILER'), async (req: any, res: any, next: any) => {
  try {
    const data = noteSchema.parse(req.body);
    const batchId = req.params.id;
    
    const batch = await BatchService.updateBatchStatus(
      batchId,
      'SOLD',
      'SELL',
      req.user._id.toString(),
      data.note
    );

    res.json({
      message: 'Batch sold successfully',
      batch
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// Get retailer's batches
// Search batch by batchId
router.get('/batches/search', requireAuth, requireRole('RETAILER'), async (req: any, res: any, next: any) => {
  try {
    const { batchId } = req.query;
    
    if (!batchId) {
      return res.status(400).json({ error: 'batchId query parameter is required' });
    }

    const batch = await Batch.findOne({ batchId })
      .populate('currentOwnerUserId', 'name email');

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json(batch);
  } catch (error) {
    next(error);
  }
});

// Get retailer's batches
router.get('/batches', requireAuth, requireRole('RETAILER'), async (req: any, res: any, next: any) => {
  try {
    const batches = await Batch.find({ currentOwnerUserId: req.user._id })
      .populate('currentOwnerUserId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ batches });
  } catch (error) {
    next(error);
  }
});

export default router;
