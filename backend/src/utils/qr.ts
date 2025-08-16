import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<Buffer> => {
  try {
    const qrBuffer = await QRCode.toBuffer(data, {
      type: 'png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrBuffer;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};
