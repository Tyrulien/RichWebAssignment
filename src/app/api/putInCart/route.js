// app/api/putInCart/route.js
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { verifyToken } from '../../utils/auth';

export async function POST(req) {
  try {
    const { productId, quantity } = await req.json();

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
    const productsCollection = db.collection('products');

    const productExists = await productsCollection.findOne({ _id: new ObjectId(productId) });
    if (!productExists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const existingItem = await cartCollection.findOne({ userId, productId });
    if (existingItem) {
      await cartCollection.updateOne(
        { _id: existingItem._id },
        { $inc: { quantity: quantity || 1 } }
      );
    } else {
      await cartCollection.insertOne({
        userId,
        productId,
        quantity: quantity || 1,
      });
    }

    return NextResponse.json({ message: 'Product added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
