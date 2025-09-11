// Import SHA-256 hashing helper used to hash leaves and nodes
import { sha256 } from './hash';

// calculateMerkleRoot: compute a Merkle root for an ordered array of string data
// - If empty: return hash of the literal 'empty' marker
// - If one item: return hash of that single item
// - Otherwise: iteratively hash pairs (duplicate last for odd count) until one root remains
export const calculateMerkleRoot = (data: string[]): string => {
  // If no items, return deterministic empty marker hash
  if (data.length === 0) return sha256('empty');

  // If single item, return its hash (leaf = root)
  if (data.length === 1) return sha256(data[0]);

  // Hash each leaf value to create the base level of the Merkle tree
  // (we avoid mutating original input by creating a new array)
  let hashes = data.map(item => sha256(item));

  // Reduce tree levels until only the root remains
  while (hashes.length > 1) {
    const newLevel: string[] = [];

    // Combine pairs of hashes; if odd, duplicate the last hash
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = i + 1 < hashes.length ? hashes[i + 1] : left; // duplicate last if needed
      // Concatenate left+right and hash to form parent node
      newLevel.push(sha256(left + right));
    }

    // Move up one level
    hashes = newLevel;
  }

  // Final remaining value is the Merkle root
  return hashes[0];
};
