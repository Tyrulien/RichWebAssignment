// app/api/updateCartItem/route.js
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { verifyToken } from '../../utils/auth';

export async function POST(req) {
  try {
    const { productId, quantity } = await req.json();

    if (!productId || quantity == null) {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
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

    const result = await cartCollection.updateOne(
      { userId, productId },
      { $set: { quantity } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cart item updated' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
