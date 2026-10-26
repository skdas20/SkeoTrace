require('ts-node/register');

const { BlockchainService } = require('../src/services/blockchain');
const { Block } = require('../src/models/Block');
const { Event } = require('../src/models/Event');
const { sha256 } = require('../src/utils/hash');
const { calculateMerkleRoot } = require('../src/utils/merkle');

const eventOne = {
  _id: 'event-1',
  type: 'BATCH_CREATED',
  batchId: 'batch-1',
  timestamp: new Date('2025-01-01T00:00:00.000Z')
};
const eventTwo = {
  _id: 'event-2',
  type: 'HARVEST_UPDATED',
  batchId: 'batch-1',
  timestamp: new Date('2025-01-02T00:00:00.000Z')
};

function eventPayload(event) {
  return JSON.stringify({
    type: event.type,
    batchId: event.batchId,
    timestamp: event.timestamp
  });
}

function makeBlock(index, timestamp, prevHash, events) {
  const merkleRoot = calculateMerkleRoot(events.map(eventPayload));
  return {
    index,
    timestamp: new Date(timestamp),
    prevHash,
    merkleRoot,
    hash: sha256(`${index}${new Date(timestamp).toISOString()}${prevHash}${merkleRoot}`),
    eventIds: events.map(event => event._id)
  };
}

function setLedgerMocks(blocks, events) {
  jest.spyOn(Block, 'find').mockReturnValue({
    sort: jest.fn().mockResolvedValue(blocks)
  });
  jest.spyOn(Event, 'find').mockImplementation(query =>
    Promise.resolve(events.filter(event => query._id.$in.includes(event._id)))
  );
}

describe('BlockchainService.verifyChain', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('accepts an untouched chain with valid hashes and Merkle roots', async () => {
    const first = makeBlock(0, '2025-01-03T00:00:00.000Z', 'GENESIS', [eventOne]);
    const second = makeBlock(1, '2025-01-04T00:00:00.000Z', first.hash, [eventTwo]);
    setLedgerMocks([first, second], [eventOne, eventTwo]);

    await expect(BlockchainService.verifyChain()).resolves.toEqual({
      ok: true,
      issues: []
    });
  });

  test('detects a changed event through its Merkle root', async () => {
    const first = makeBlock(0, '2025-01-03T00:00:00.000Z', 'GENESIS', [eventOne]);
    const changedEvent = { ...eventOne, type: 'TRANSFER' };
    setLedgerMocks([first], [changedEvent]);

    const result = await BlockchainService.verifyChain();

    expect(result.ok).toBe(false);
    expect(result.issues.some(issue => issue.includes('Invalid merkle root'))).toBe(true);
  });

  test('detects an altered block hash', async () => {
    const first = makeBlock(0, '2025-01-03T00:00:00.000Z', 'GENESIS', [eventOne]);
    const alteredFirst = { ...first, hash: 'tampered-hash' };
    const second = makeBlock(1, '2025-01-04T00:00:00.000Z', first.hash, [eventTwo]);
    setLedgerMocks([alteredFirst, second], [eventOne, eventTwo]);

    const result = await BlockchainService.verifyChain();

    expect(result.ok).toBe(false);
    expect(result.issues.some(issue => issue.includes('Invalid hash'))).toBe(true);
    expect(result.issues.some(issue => issue.includes('Invalid prevHash'))).toBe(true);
  });
});
