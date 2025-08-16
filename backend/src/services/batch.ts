import { Batch, IBatch, BatchStatus } from '../models/Batch';
import { Event, EventType } from '../models/Event';
import { User } from '../models/User';
import { BlockchainService } from './blockchain';

export class BatchService {
  static async createBatch(data: {
    batchId: string;
    productType: string;
    originFarm: string;
    harvestDate?: Date;
    actorUserId: string;
  }): Promise<IBatch> {
    // Check if batch already exists
    const existingBatch = await Batch.findOne({ batchId: data.batchId });
    if (existingBatch) {
      throw new Error('Batch with this ID already exists');
    }

    // Create batch
    const batch = new Batch({
      batchId: data.batchId,
      productType: data.productType,
      originFarm: data.originFarm,
      harvestDate: data.harvestDate,
      status: 'CREATED',
      currentOwnerUserId: data.actorUserId,
      eventIds: []
    });

    await batch.save();

    // Create event
    const event = new Event({
      batchId: data.batchId,
      type: 'BATCH_CREATED',
      payload: {
        productType: data.productType,
        originFarm: data.originFarm,
        harvestDate: data.harvestDate
      },
      actorUserId: data.actorUserId
    });

    await event.save();

    // Update batch with event
    batch.eventIds.push(event._id);
    await batch.save();

    // Create block
    await BlockchainService.createBlock([event._id.toString()]);

    return batch;
  }

  static async updateBatch(
    batchId: string,
    updates: {
      harvestDate?: Date;
      certification?: any;
    },
    actorUserId: string
  ): Promise<IBatch> {
    const batch = await Batch.findOne({ batchId });
    if (!batch) {
      throw new Error('Batch not found');
    }

    // Check ownership
    if (batch.currentOwnerUserId?.toString() !== actorUserId) {
      throw new Error('Only the current owner can update the batch');
    }

    const events: any[] = [];

    if (updates.harvestDate) {
      batch.harvestDate = updates.harvestDate;
      
      const event = new Event({
        batchId,
        type: 'HARVEST_UPDATED',
        payload: { harvestDate: updates.harvestDate },
        actorUserId
      });
      
      await event.save();
      events.push(event);
      batch.eventIds.push(event._id);
    }

    if (updates.certification) {
      batch.certification = updates.certification;
      if (updates.certification.status === 'APPROVED') {
        batch.status = 'CERTIFIED';
      }
      
      const event = new Event({
        batchId,
        type: 'CERT_UPLOAD',
        payload: { certification: updates.certification },
        actorUserId
      });
      
      await event.save();
      events.push(event);
      batch.eventIds.push(event._id);
    }

    await batch.save();

    // Create block if there are events
    if (events.length > 0) {
      await BlockchainService.createBlock(events.map(e => e._id.toString()));
    }

    return batch;
  }

  static async transferBatch(
    batchId: string,
    toRetailerUserId: string,
    actorUserId: string,
    note?: string
  ): Promise<IBatch> {
    const batch = await Batch.findOne({ batchId });
    if (!batch) {
      throw new Error('Batch not found');
    }

    // Check ownership
    if (batch.currentOwnerUserId?.toString() !== actorUserId) {
      throw new Error('Only the current owner can transfer the batch');
    }

    // Verify retailer exists
    const retailer = await User.findById(toRetailerUserId);
    if (!retailer || retailer.role !== 'RETAILER') {
      throw new Error('Invalid retailer');
    }

    // Update batch
    batch.currentOwnerUserId = retailer._id;
    batch.status = 'IN_TRANSIT';

    const event = new Event({
      batchId,
      type: 'TRANSFER',
      payload: {
        toRetailerUserId,
        toRetailerName: retailer.name,
        note
      },
      actorUserId
    });

    await event.save();
    batch.eventIds.push(event._id);
    await batch.save();

    // Create block
    await BlockchainService.createBlock([event._id.toString()]);

    return batch;
  }

  static async updateBatchStatus(
    batchId: string,
    status: BatchStatus,
    eventType: EventType,
    actorUserId: string,
    note?: string
  ): Promise<IBatch> {
    const batch = await Batch.findOne({ batchId });
    if (!batch) {
      throw new Error('Batch not found');
    }

    // Check ownership for retailers
    if (batch.currentOwnerUserId?.toString() !== actorUserId) {
      throw new Error('Only the current owner can update the batch status');
    }

    // Business rules
    if (eventType === 'SELL' && !['RECEIVED', 'STORED'].includes(batch.status)) {
      throw new Error('Can only sell after receiving or storing');
    }

    batch.status = status;

    const event = new Event({
      batchId,
      type: eventType,
      payload: { note, previousStatus: batch.status },
      actorUserId
    });

    await event.save();
    batch.eventIds.push(event._id);
    await batch.save();

    // Create block
    await BlockchainService.createBlock([event._id.toString()]);

    return batch;
  }
}
