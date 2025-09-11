import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import { BatchService } from '../services/batch';
import { Batch } from '../models/Batch';
import { User } from '../models/User';

const router = express.Router();

const createBatchSchema = z.object({
  batchId: z.string().min(1).max(100),
  productType: z.string().min(1).max(100),
  originFarm: z.string().min(1).max(200),
  harvestDate: z.string().optional()
});

const updateBatchSchema = z.object({
  harvestDate: z.string().optional(),
  certification: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
    docUrl: z.string().url().optional(),
    signedBy: z.string().optional(),
    signedAt: z.string().datetime().optional()
  }).optional()
});

// Accept either a retailer user id or retailer email (frontend currently sends email)
const transferBatchSchema = z.object({
  toRetailerUserId: z.string().min(1).optional(),
  toRetailerEmail: z.string().email().optional(),
  note: z.string().optional()
}).refine((val) => !!(val.toRetailerUserId || val.toRetailerEmail), {
  message: 'Either toRetailerUserId or toRetailerEmail is required'
});

// POST /api/producer/batches - create a new batch (producer-only)
router.post('/batches', requireAuth, requireRole('PRODUCER'), async (req: any, res: any, next: any) => {
  try {
    const data = createBatchSchema.parse(req.body);
    
    // Validate and convert harvest date if provided
    let harvestDate: Date | undefined;
    if (data.harvestDate) {
      harvestDate = new Date(data.harvestDate);
      if (isNaN(harvestDate.getTime())) {
        return res.status(400).json({ error: 'Invalid harvest date format' });
      }
    }
    
    const batch = await BatchService.createBatch({
      batchId: data.batchId,
      productType: data.productType,
      originFarm: data.originFarm,
      harvestDate,
      actorUserId: req.user._id.toString()
    });

    res.status(201).json({
      message: 'Batch created successfully',
      batch
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// PATCH /api/producer/batches/:id - update an existing batch
router.patch('/batches/:id', requireAuth, requireRole('PRODUCER'), async (req: any, res: any, next: any) => {
  try {
    const data = updateBatchSchema.parse(req.body);
    const batchId = req.params.id;
    
    const updates: any = {};
    if (data.harvestDate) updates.harvestDate = new Date(data.harvestDate);
    if (data.certification) updates.certification = data.certification;

    const batch = await BatchService.updateBatch(
      batchId,
      updates,
      req.user._id.toString()
    );

    res.json({
      message: 'Batch updated successfully',
      batch
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// POST /api/producer/batches/:id/transfer - transfer a batch to a retailer
router.post('/batches/:id/transfer', requireAuth, requireRole('PRODUCER'), async (req: any, res: any, next: any) => {
  try {
    const data = transferBatchSchema.parse(req.body);
    const batchId = req.params.id;

    // Resolve retailer user id if frontend supplied email instead
    let toRetailerUserId = data.toRetailerUserId as string | undefined;
    if (!toRetailerUserId && data.toRetailerEmail) {
      const retailer = await User.findOne({ email: data.toRetailerEmail });
      if (!retailer) return res.status(400).json({ error: 'Retailer not found for provided email' });
      toRetailerUserId = retailer._id.toString();
    }

    const batch = await BatchService.transferBatch(
      batchId,
      toRetailerUserId!,
      req.user._id.toString(),
      data.note
    );

    res.json({
      message: 'Batch transferred successfully',
      batch
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// GET /api/producer/batches - retrieve all batches for the producer
router.get('/batches', requireAuth, requireRole('PRODUCER'), async (req: any, res: any, next: any) => {
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
