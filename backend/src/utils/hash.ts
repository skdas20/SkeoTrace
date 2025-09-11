// Node crypto helper used to produce deterministic SHA-256 hex digests
import crypto from 'crypto';

// sha256: returns hex-encoded SHA-256 digest of a string
export const sha256 = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// hashData: convenience wrapper that stringifies arbitrary data then hashes it
// Useful for hashing JSON payloads (events, objects) in a consistent way
export const hashData = (data: any): string => {
  return sha256(JSON.stringify(data));
};
