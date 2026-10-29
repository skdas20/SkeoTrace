const { calculateMerkleRoot } = require('../src/utils/merkle');

describe('calculateMerkleRoot', () => {
  test('returns the known root for a fixed pair of leaves', () => {
    expect(calculateMerkleRoot(['event-a', 'event-b'])).toBe(
      '7edff3d61d4ff742aa61233248fb71ee75880cf6ec801c089d9064b5351adeb7'
    );
  });

  test('returns a deterministic hash for an empty tree', () => {
    expect(calculateMerkleRoot([])).toBe(
      '2e1cfa82b035c26cbbbdae632cea070514eb8b773f616aaeaf668e2f0be8f10d'
    );
  });

  test('changes the root when a leaf changes', () => {
    expect(calculateMerkleRoot(['event-a', 'event-b'])).not.toBe(
      calculateMerkleRoot(['event-a', 'event-changed'])
    );
  });

  test('duplicates the final leaf when the number of leaves is odd', () => {
    expect(calculateMerkleRoot(['event-a', 'event-b', 'event-c'])).toBe(
      'f50bc5a64a75c110294c4967461cdd27533fb9e0c770e149e08dc7aa6334a1f6'
    );
  });
});
