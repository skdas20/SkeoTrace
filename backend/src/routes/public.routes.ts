import express from 'express';
import { Batch } from '../models/Batch';
import { BlockchainService } from '../services/blockchain';
import { Block } from '../models/Block';
import { generateQRCode } from '../utils/qr';
import { env } from '../config/env';

const router = express.Router();

// Get full traceability for a batch
router.get('/trace/:batchId', async (req: any, res: any, next: any) => {
  try {
    const { batchId } = req.params;
    
    const batch = await Batch.findOne({ batchId })
      .populate('currentOwnerUserId', 'name email')
      .populate('eventIds');

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

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

// Generate QR code for batch
router.get('/qrcode/:batchId', async (req: any, res: any, next: any) => {
  try {
    const { batchId } = req.params;
    
    // Check if batch exists
    const batch = await Batch.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const traceUrl = `${env.FRONTEND_PUBLIC_URL}/trace/${batchId}`;
    const qrBuffer = await generateQRCode(traceUrl);

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
