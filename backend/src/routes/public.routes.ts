// Public routes: trace viewing and QR generation for consumers
import express from 'express';
import { Batch } from '../models/Batch';
import { BlockchainService } from '../services/blockchain';
import { Block } from '../models/Block';
import { generateQRCode } from '../utils/qr';
import { env } from '../config/env';

const router = express.Router();

// GET /api/public/trace/:batchId - return batch info, timeline and integrity
router.get('/trace/:batchId', async (req: any, res: any, next: any) => {
  try {
    const { batchId } = req.params;

    // Load batch and populate owner and events
    const batch = await Batch.findOne({ batchId })
      .populate('currentOwnerUserId', 'name email')
      .populate('eventIds');

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Get timeline (events) and run a chain integrity check
    const { timeline } = await BlockchainService.getBatchHistory(batchId);
    const { ok, issues } = await BlockchainService.verifyChain();
    const blockCount = await Block.countDocuments();

    res.json({
      batch: {
        batchId: batch.batchId,
        productType: batch.productType,
        originFarm: batch.originFarm,
        harvestDate: batch.harvestDate,
        status: batch.status,
        certification: batch.certification,
        currentOwner: batch.currentOwnerUserId
      },
      timeline,
      integrity: {
        verified: ok,
        blocks: blockCount,
        issues: issues.length > 0 ? issues : undefined
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/public/qrcode/:batchId - return PNG QR that links to public trace URL
router.get('/qrcode/:batchId', async (req: any, res: any, next: any) => {
  try {
    const { batchId } = req.params;

    // Validate batch exists
    const batch = await Batch.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Compose trace URL and generate QR PNG buffer
    const traceUrl = `${env.FRONTEND_PUBLIC_URL}/trace/${batchId}`;
    const qrBuffer = await generateQRCode(traceUrl);

    // Send PNG with caching headers
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': qrBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });

    res.send(qrBuffer);
  } catch (error) {
    next(error);
  }
});

export default router;
