import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { encrypt } from '@/lib/encryption';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    
    return NextResponse.json({ hasKey: !!user?.groqApiKey });
  } catch (error) {
    console.error('API Key GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groqApiKey } = await req.json();

    if (!groqApiKey || typeof groqApiKey !== 'string' || !groqApiKey.startsWith('gsk_')) {
      return NextResponse.json(
        { error: 'Invalid API key format. Must start with gsk_' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const encryptedKey = encrypt(groqApiKey.trim());
    
    await User.findByIdAndUpdate(session.user.id, {
      groqApiKey: encryptedKey,
    });

    return NextResponse.json({ message: 'API key saved' });
  } catch (error) {
    console.error('API Key POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    await User.findByIdAndUpdate(session.user.id, {
      $unset: { groqApiKey: 1 },
    });

    return NextResponse.json({ message: 'API key removed' });
  } catch (error) {
    console.error('API Key DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
