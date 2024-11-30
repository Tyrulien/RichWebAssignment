// app/api/getProducts/route.js
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { verifyToken } from '../../../utils/auth';

export async function GET(req) {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  const dbName = 'app';

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      verifyToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('products');
    const products = await collection.find({}).toArray();

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  } finally {
    await client.close();
  }
}
