// app/api/removeFromCart/route.js
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { verifyToken } from '../../utils/auth';

export async function POST(req) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    const dbName = 'app';

    await client.connect();
    const db = client.db(dbName);
    const cartCollection = db.collection('shopping_cart');

    const result = await cartCollection.deleteOne({ userId, productId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
