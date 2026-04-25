import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.warn(
    'ENCRYPTION_KEY is not set. API key encryption will not work.'
  );
}

/**
 * Encrypt a plaintext string using AES-256-CBC.
 * Returns a string in the format `iv:encryptedData` (both hex-encoded).
 */
export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a string that was encrypted with encrypt().
 * Expects input in the format `iv:encryptedData` (both hex-encoded).
 */
export function decrypt(encrypted: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  const [ivHex, encryptedData] = encrypted.split(':');

  if (!ivHex || !encryptedData) {
    throw new Error('Invalid encrypted string format');
  }

  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
