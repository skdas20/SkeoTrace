import { sha256 } from './hash';

export const calculateMerkleRoot = (data: string[]): string => {
  if (data.length === 0) return sha256('empty');
  if (data.length === 1) return sha256(data[0]);

  // Create a copy to avoid mutating the original array
  let hashes = data.map(item => sha256(item));

  while (hashes.length > 1) {
    const newLevel: string[] = [];
    
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = i + 1 < hashes.length ? hashes[i + 1] : left;
      newLevel.push(sha256(left + right));
    }
    
    hashes = newLevel;
  }

  return hashes[0];
};
