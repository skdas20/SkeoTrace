import crypto from 'crypto';

export const sha256 = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const hashData = (data: any): string => {
  return sha256(JSON.stringify(data));
};
