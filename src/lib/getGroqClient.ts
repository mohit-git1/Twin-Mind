import Groq from 'groq-sdk';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { decrypt } from '@/lib/encryption';

export async function getGroqClient(userId: string) {
  await dbConnect();
  
  const user = await User.findById(userId);
  
  if (!user || !user.groqApiKey) {
    throw new Error('NO_API_KEY');
  }

  try {
    const decryptedKey = decrypt(user.groqApiKey);
    return new Groq({ apiKey: decryptedKey });
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    throw new Error('NO_API_KEY');
  }
}
