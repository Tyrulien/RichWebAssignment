// app/api/getCartItems/route.js
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { verifyToken } from '../../utils/auth';

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
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    await client.connect();
    const db = client.db(dbName);
    const cartCollection = db.collection('shopping_cart');
    const productsCollection = db.collection('products');

    const cartItems = await cartCollection.find({ userId }).toArray();

    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
        if (!product) {
          throw new Error('Product not found');
        }
        return {
          productId: item.productId,
          title: product.title,
          description: product.description,
          image: product.image,
          price: product.price,
          quantity: item.quantity,
        };
      })
    );

    const totalCost = itemsWithDetails.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    return NextResponse.json({ cartItems: itemsWithDetails, totalCost });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await client.close();
  }
}
